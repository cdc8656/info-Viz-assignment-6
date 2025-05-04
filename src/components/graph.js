import {useEffect, useRef} from 'react'; 
import * as d3 from 'd3';
import { getNodes } from '../utils/getNodes';
import { getLinks } from '../utils/getLinks';
import { drag } from '../utils/drag';

export function Graph(props) {
    const { margin, svg_width, svg_height, data } = props;

    const nodes = getNodes({rawData: data});
    const links = getLinks({rawData: data});

    const width = svg_width - margin.left - margin.right;
    const height = svg_height - margin.top - margin.bottom;

    const lineWidth = d3.scaleLinear().range([2, 6]).domain([d3.min(links, d => d.value), d3.max(links, d => d.value)]);
    const radius = d3.scaleLinear().range([10, 50])
            .domain([d3.min(nodes, d => d.value), d3.max(nodes, d => d.value)]);
    const color = d3.scaleOrdinal().range(d3.schemeCategory10).domain(nodes.map(d => d.name));

    const d3Selection = useRef();

    useEffect(() => {
        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.name).distance(d => 20/d.value))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width/2, height/2))
            .force("y", d3.forceY([height/2]).strength(0.02))
            .force("collide", d3.forceCollide().radius(d => radius(d.value)+20))
            .tick(3000);

        const g = d3.select(d3Selection.current);

        const link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => lineWidth(d.value));

        const node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("r", d => radius(d.value))
            .attr("fill", d => color(d.name))
            .call(drag(simulation));

        // ✅ Add Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("opacity", 0);
        //call back function for the mouse events 
        function handleMouseOver(event, d) {
            tooltip
                .style("opacity", 1)
                .html(d.name)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        }

        function handleMouseOut() {
            tooltip
                .style("opacity", 0);
        }
        // call back implementation
        node.on("mouseover", handleMouseOver)
            .on("mousemove", (event) => {
                tooltip
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", handleMouseOut);

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        // ✅ Add Legend
        const legend = g.append("g")
            .attr("transform", `translate(0,0)`);

        const legendItems = legend.selectAll("g")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("transform", (d, i) => `translate(10, ${i * 20 + 10})`);

        legendItems.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", d => color(d));

        legendItems.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .attr("dy", "0.32em")
            .text(d => d)
            .style("font-size", "10px")
            .style("fill", "#000");

        // Clean up tooltip when component unmounts
        return () => {
            tooltip.remove();
        };

    }, [width, height]);

    return (
        <svg 
            viewBox={`0 0 ${svg_width} ${svg_height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "100%", height: "100%" }}
        > 
            <g ref={d3Selection} transform={`translate(${margin.left}, ${margin.top})`}></g>
        </svg>
    );
}
