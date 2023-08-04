// get dom elements
const selectBox = document.getElementById('selDataset');
const metaData = document.getElementById('sample-metadata');
const bar = document.getElementById('barChart');


// variables
let data;
let isLoading = true;
let optionHtml = ``



// fetching data from url
const fetchData = async () => {
  try {
    const res = await fetch('https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json');
    data = await res.json();
  }
  catch (err) {
    alert(err);
  }
}


// handlers
const renderInfo = (id) => {
  const info = data.metadata.find(el => el.id == id)
  metaData.innerHTML = `<p class="m-0">id: ${info.id}</p>
              <p class="m-0">ethnicity: ${info.ethnicity}</p>
              <p class="m-0">gender: ${info.gender}</p>
              <p class="m-0">age: ${info.age}</p>
              <p class="m-0">location: ${info.location}</p>
              <p class="m-0">bbtype: ${info.bbtype}</p>
              <p class="m-0">wfreq : ${info.wfreq}</p>`
}


const renderBarChat = (value) => {
  // Clear the previous chart
  d3.select("#barChart").html('');

  let st1 = data.samples.find(el => el.id == value);
  let st2 = st1.otu_ids.reduce((acc, el, index) => {
    acc.push({
      'otu_id': el,
      'sample_value': st1.sample_values[index],
      'otu_label': st1.otu_labels[index]
    })

    return acc;
  }, []);
  let st3 = st2.sort((a, b) => b.sample_value - a.sample_value).slice(0, 10).reverse();

  // Define chart dimensions
  const margin = { top: 10, right: 20, bottom: 60, left: 80 };
  const width = 600 - margin.left - margin.right;
  const height = 520 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select("#barChart")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("width", "100%") // Set width to 100% of the container
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(st3, d => d.sample_value)])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(st3.map(d => `OTU ${d.otu_id}`))
    .range([height, 0])
    .padding(0.1);

  // Create x-axis
  const xAxis = d3.axisBottom(xScale).ticks(4);

  // Create y-axis
  const yAxis = d3.axisLeft(yScale);

  // Append x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Append y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

  var div = d3.select("#barChart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


  // Append vertical gridlines
  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScale.ticks())
    .enter().append("line")
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ddd")  // Gridline color
    .style("stroke-width", 1)  // Gridline width
    .style("opacity", 0.5);    // Gridline opacity

  // Create bars
  const bars = svg.selectAll(".bar")
    .data(st3)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", 2)
    .attr("y", d => yScale(`OTU ${d.otu_id}`))
    .attr("width", d => xScale(d.sample_value))
    .attr("height", yScale.bandwidth())
    .attr("fill", "steelblue")
    .on("mouseover", function (d) {
      d3.select(this).transition().duration(50).attr("opacity", 0.85);
      div.transition().duration(50).style("opacity", 1);
      let tooltipText = `${d.target.__data__.otu_label}`;
      div.html(tooltipText)
        .style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).transition().duration(50).attr("opacity", 1);
      div.transition().duration(50).style("opacity", 0);
    });
};

const renderBubbleChart = (value) => {
  d3.select("#bubble").html('');

  let st1 = data.samples.find(el => el.id == value);
  let st2 = st1.otu_ids.reduce((acc, el, index) => {
    acc.push({
      'otu_id': el,
      'sample_value': st1.sample_values[index],
      'otu_label': st1.otu_labels[index]
    })

    return acc;
  }, []);

  const margin = { top: 30, right: 20, bottom: 60, left: 60 };
  const width = 1000 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create SVG element
  const svg = d3.select("#bubble")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("width", "100%") // Set width to 100% of the container
    .attr("height", "100%")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(st2, d => d.otu_id)])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(st2, d => d.sample_value)])
    .range([height, 0]);

  const sizeScale = d3.scaleLinear()
    .domain([0, d3.max(st2, d => d.sample_value)])
    .range([5, 30]); // Adjust the range for marker size

  // Append vertical gridlines
  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(xScale.ticks())
    .enter().append("line")
    .attr("x1", d => xScale(d))
    .attr("x2", d => xScale(d))
    .attr("y1", 0)
    .attr("y2", height)
    .style("stroke", "#ddd")  // Gridline color
    .style("stroke-width", 1)  // Gridline width
    .style("opacity", 0.5);    // Gridline opacity


  // Append horizontal gridlines
  svg.append("g")
    .attr("class", "grid")
    .selectAll("line")
    .data(yScale.ticks())
    .enter().append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .style("stroke", "#ddd")  // Gridline color
    .style("stroke-width", 1)  // Gridline width
    .style("opacity", 0.5);    // Gridline opacity


  var div = d3.select("#bubble").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Create bubbles
  const bubbles = svg.selectAll(".bubble")
    .data(st2)
    .enter().append("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.otu_id))
    .attr("cy", d => yScale(d.sample_value))
    .attr("r", d => sizeScale(d.sample_value))
    .attr("fill", d => `hsl(${d.otu_id % 360}, 70%, 50%)`)
    .attr("opacity", 0.7)
    .on("mouseover", function (d) {
      d3.select(this).transition().duration(50).attr("opacity", 0.85);
      div.transition().duration(50).style("opacity", 1);
      let tooltipText = `${d.target.__data__.otu_label}`;
      div.html(tooltipText)
        .style("left", (d.pageX + 10) + "px")
        .style("top", (d.pageY - 15) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).transition().duration(50).attr("opacity", 1);
      div.transition().duration(50).style("opacity", 0);
    });


  // Create x-axis
  const xAxis = d3.axisBottom(xScale);

  // Create y-axis
  const yAxis = d3.axisLeft(yScale).ticks(5);

  // Append x-axis
  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  // Append y-axis
  svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

}

const colors = [
  '#FF0000', '#FF4500', '#FF8000', '#FFD700', '#DAA520',
  '#ADFF2F', '#32CD32', '#008000', '#006400'
];

const renderGuage = (value) => {
  const freq = data.metadata.find(el => el.id == value).wfreq;
  // Sample value for wfreq
  let guageData = [
    {
      type: "indicator",
      mode: "gauge+number",
      value: freq,
      title: { text: "Washing Frequency", font: { size: 24 } },
      gauge: {
        axis: { range: [0, 9], tickwidth: 2, tickcolor: "darkblue" },
        bar: { color: "darkblue" },
        bgcolor: "white",
        borderwidth: 4,
        bordercolor: "gray",
        steps: [
          { range: [0, 9], color: "cyan" },
          { range: [0, 9], color: "royalblue" }
        ]
      }
    }
  ];

  var layout = { width: 500, height: "auto", margin: { t: 0, b: 0 } };
  Plotly.newPlot('gauge', guageData, layout);
}



const optionChanged = (value) => {
  renderInfo(value);
  renderBarChat(value);
  renderBubbleChart(value)
  renderGuage(value);
}

const setOptions = () => {
  let value = null;
  data.names.map((el, index) => {
    if (index == 0) {
      value = el;
      optionHtml += `<option selected value = ${el}> ${el}</option> `
    }
    else {
      optionHtml += `<option value = ${el}> ${el}</option> `
    }
  })
  selectBox.innerHTML = optionHtml;
  console.log(selectBox.innerHTML);
  renderInfo(value);
  renderBarChat(value);
  renderBubbleChart(value)
  renderGuage(value);
}


// Event Handling

window.addEventListener("load", async () => {
  isLoading = true;
  let localData = localStorage.getItem("data");
  // console.log(localData);
  if (localData !== undefined) {
    data = JSON.parse(localData);
    if (!data) {
      await fetchData();
      console.log(data);
    }
  }
  else {
    await fetchData();
  }
  console.log(data);
  isLoading = false;
  setOptions();
})

window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  if (data) {
    localStorage.setItem('data', JSON.stringify(data));
  }
});