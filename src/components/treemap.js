import {
    treemap,
    hierarchy,
    scaleOrdinal,
    schemeDark2,
    format
  } from "d3";
  

  function truncate(str, maxChars) {
    return str.length > maxChars ? str.slice(0, maxChars - 1) + "…" : str;
  }
  
  function Text({ x, y, name, valueText, boxWidth, boxHeight }) {
    const fontSize = Math.max(10, Math.min(14, boxHeight / 4));
    const maxChars = Math.floor(boxWidth / (fontSize * 0.6));
  
    const truncatedName = truncate(name, maxChars);
    const truncatedValue = truncate(valueText, maxChars);
  
    return (
      <>
        <text
          x={x}
          y={y}
          fontSize={fontSize}
          fontWeight="bold"
          fill="white"
          pointerEvents="none"
        >
          {truncatedName}
        </text>
        <text
          x={x}
          y={y + fontSize + 2}
          fontSize={fontSize - 2}
          fill="white"
          pointerEvents="none"
        >
          {truncatedValue}
        </text>
      </>
    );
  }
  
  export function TreeMap(props) {
    const {
      margin,
      svg_width,
      svg_height,
      tree,
      selectedCell,
      setSelectedCell,
    } = props;
  
    const innerWidth = svg_width - margin.left - margin.right;
    const innerHeight = svg_height - margin.top - margin.bottom;
  
    const root = hierarchy(tree)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);
  
    treemap().size([innerWidth, innerHeight]).padding(2)(root);
  
    const formatValue = format(",");
    const color = scaleOrdinal(schemeDark2);
  
    return (
      <svg
        viewBox={`0 0 ${svg_width} ${svg_height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%" }}
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {root.descendants().map((node, index) => {
            const width = node.x1 - node.x0;
            const height = node.y1 - node.y0;
            const name = node.data.name;
            const percent =
              node.value && root.value
                ? `${((node.value / root.value) * 100).toFixed(1)}%`
                : "";
  
            const group = node.ancestors()[1]?.data.name || "root";
            const fillColor = color(group);
  
            return (
              <g
                key={index}
                transform={`translate(${node.x0},${node.y0})`}
                onClick={() => setSelectedCell(name)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  width={width}
                  height={height}
                  fill={fillColor}
                  stroke={selectedCell === name ? "black" : "white"}
                  strokeWidth={selectedCell === name ? 3 : 1}
                  onMouseOver={(e) => e.currentTarget.setAttribute("fill", "red")}
                  onMouseOut={(e) =>
                    e.currentTarget.setAttribute("fill", fillColor)
                  }
                  style={{ transition: "fill 0.3s" }}
                />
  
                
                {width > 30 && height > 20 && (
                  <Text
                    x={4}
                    y={14}
                    name={name}
                    valueText={percent}
                    boxWidth={width}
                    boxHeight={height}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  }
  