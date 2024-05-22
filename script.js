const canvas = document.getElementById('network-canvas');
const ctx = canvas.getContext('2d');
const generateBtn = document.getElementById('generate-btn');
const mstBtn = document.getElementById('mst-btn');
const nodesInput = document.getElementById('nodes');
const connectionsInput = document.getElementById('connections');
const mstPathElement = document.getElementById('mst-path');
const mstCostElement = document.getElementById('mst-cost');

let allConnections = [];
let mstConnections = [];
let mstPath = '';
let mstCost = 0;

generateBtn.addEventListener('click', () => {
    const nodes = nodesInput.value.split(',').map(node => node.trim());
    allConnections = connectionsInput.value.split('\n').map(connection => {
        const [city1, city2, cost] = connection.split(',').map(value => value.trim());
        return { city1, city2, cost: parseFloat(cost) };
    });

    drawNetwork(allConnections, nodes, false);
    mstPathElement.textContent = ''; // Clear the previous path
    mstCostElement.textContent = ''; // Clear the previous cost
});

mstBtn.addEventListener('click', () => {
    mstConnections = kruskal(allConnections, nodesInput.value.split(',').map(node => node.trim()));
    drawNetwork(mstConnections, nodesInput.value.split(',').map(node => node.trim()), true);
    printMSTPath(mstConnections);
});

function findParent(parent, city) {
    while (parent[city] !== city) {
        city = parent[city];
    }
    return city;
}

function unionSets(parent, rank, x, y) {
    let xroot = findParent(parent, x);
    let yroot = findParent(parent, y);
    if (rank[xroot] < rank[yroot]) {
        parent[xroot] = yroot;
    } else if (rank[xroot] > rank[yroot]) {
        parent[yroot] = xroot;
    } else {
        parent[yroot] = xroot;
        rank[xroot] += 1;
    }
}

function kruskal(connections, cities) {
    const result = [];
    const parent = {};
    const rank = {};

    // Initialize parent and rank
    for (let city of cities) {
        parent[city] = city;
        rank[city] = 0;
    }

    // Sort connections by cost
    connections.sort((a, b) => a.cost - b.cost);

    // Apply Kruskal's algorithm
    for (let connection of connections) {
        const city1 = connection.city1;
        const city2 = connection.city2;
        const cost = connection.cost;
        const city1Root = findParent(parent, city1);
        const city2Root = findParent(parent, city2);
        if (city1Root !== city2Root) {
            result.push({ city1, city2, cost });
            unionSets(parent, rank, city1Root, city2Root);
        }
    }

    return result;
}

function drawNetwork(connections, cities, isMST) {
    const width = 800;
    const height = 600;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw cities in a circular layout
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;
    const cityRadius = 20;
    const cityPositions = new Map();
    for (let i = 0; i < cities.length; i++) {
        const angle = (2 * Math.PI * i) / cities.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        cityPositions.set(cities[i], { x, y });
        ctx.beginPath();
        ctx.arc(x, y, cityRadius, 0, 2 * Math.PI);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.font = '16px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(cities[i], x - 5, y + 5);
    }

    // Draw connections
    for (let connection of connections) {
        const city1Pos = cityPositions.get(connection.city1);
        const city2Pos = cityPositions.get(connection.city2);
        ctx.beginPath();
        ctx.moveTo(city1Pos.x, city1Pos.y);
        ctx.lineTo(city2Pos.x, city2Pos.y);
        ctx.strokeStyle = isMST ? '#00ff00' : '#000';
        ctx.stroke();
        ctx.font = '14px Arial';
        ctx.fillStyle = isMST ? '#00ff00' : '#000';
        ctx.fillText(connection.cost, (city1Pos.x + city2Pos.x) / 2, (city1Pos.y + city2Pos.y) / 2);
    }
}

function printMSTPath(mstConnections) {
    let path = '';
    let totalCost = 0;
    for (const connection of mstConnections) {
        path += `${connection.city1} -> ${connection.city2} (Cost: ${connection.cost}) -> `;
        totalCost += connection.cost;
    }
    path = path.slice(0, -4); // Remove the trailing " -> "
    mstPathElement.textContent = path;
    mstPath = path;
    mstCost = totalCost;
    mstCostElement.textContent = `Total Cost: ${totalCost}`;
}