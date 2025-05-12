class Recovering {
    constructor(time)
    {
        this.time = time;
    }
    next()
    {
        if(this.time==0)
        {
            return 'offline';
        }
        else
        {
            this.time--;
            return this;
        }
    }
}

//Just a simple cellular automata class. Of course, it's important to encapsulate all your code with classes 
//Having it laid out in this way makes it easier to maintain. No one in their right mind would disagree with that, surely?
class Automata {
    constructor(scale, canvas)
    {
        //constants
        this.CELL_WIDTH = scale;
        this.CELL_HEIGHT = Math.sqrt(this.CELL_WIDTH**2 - (this.CELL_WIDTH/2)**2); //find the vertical height of the triangle with side length this.scale. Pythagoras we love you

        this.CANVAS = canvas;

        // drawing params for the dark dots at each cell
        this.DOT_RADIUS = this.CELL_WIDTH * .05;
        this.DOT_FILL_COLOR = '#0E0067';
        this.DOT_FILL_OPACITY = 0.5;

        // drawing params for the greyish lines between each cell
        this.LINK_CHANNEL_COLOR = '#0E0067';
        this.LINK_CHANNEL_WIDTH = this.CELL_WIDTH * 0.025;
        this.LINK_CHANNEL_OPACITY = 0.05;

        // drawing params for the bright blue lines between each cell when they're active
        this.ACTIVE_LINK_COLOR = '#3D59FD'; //'#0026FF' @ 0.75 opacity
        this.ACTIVE_LINK_WIDTH = this.CELL_WIDTH * 0.05;
        this.ACTIVE_LINK_OPACITY = 1; //0.75;

        this.cells = []; //the state of the automata
        this.dotElementHandles = []; //the SVG elements responsible for displaying the dots. these correspond to cells
        this.lineElementHandles = []; //the SVG elements responsible for displaying the colored lines. these do not correspond with cells, they are paths between cells

        //properties that depend on resize()
        this.isPortrait = undefined;
        this.currentlySizedFor = {
            height: undefined,
            width: undefined
        };
        
        //set margin sizes. necessary as if the display were to start at exactly (0,0), some of it would be cut off
        this.margins = { 
            height: undefined,
            width: undefined
        };
    }
    
    /** 
     * Resize the automata to fit its container
     */
    resize()
    {
        const { width: canvasWidth, height: canvasHeight } = this.CANVAS.getBoundingClientRect();

        //if the height actually changed, update the display (the eventlistener is sometimes called erroneously when scrolling on mobile)
        if(canvasHeight!=this.currentlySizedFor.height || canvasWidth!=this.currentlySizedFor.width)
        {
            this.currentlySizedFor.height = canvasWidth;
            this.currentlySizedFor.width = canvasWidth;

            //size the cellular automata grid to the display
            const prevWidth = this.width;
            const prevHeight = this.height;
            this.width = Math.floor(canvasWidth / this.CELL_WIDTH);
            this.height = Math.floor(canvasHeight / this.CELL_HEIGHT); //should be based on screen aspect ratio

            // set the margins to the remainder (but no less than the radius of the dots, or they'll be cut off)
            this.margins = {
                width: Math.max(this.DOT_RADIUS, canvasWidth % this.CELL_WIDTH),
                height: Math.max(this.DOT_RADIUS, canvasHeight % this.CELL_HEIGHT)
            };

            //destroy the previous display
            this.CANVAS.innerHTML = '';
            
            const dots = document.createElementNS(this.CANVAS.namespaceURI, 'g');
            dots.id = 'dots';
            this.CANVAS.appendChild(dots);
            
            const links = document.createElementNS(this.CANVAS.namespaceURI, 'g');
            links.id = 'links';
            this.CANVAS.appendChild(links);

            const channels = document.createElementNS(this.CANVAS.namespaceURI, 'g');
            channels.id = 'channels';
            this.CANVAS.appendChild(channels);
            
            //update the arrays
            const nextCells = new Array(this.width);
            this.lineElementHandles = new Array(this.width);
            this.dotElementHandles = new Array(this.width);
            //init the arrays
            for(let i=0; i<this.width;i++) {
                // init cells and copy over the data
                nextCells[i] = new Array(this.height);
                for(let j=0; j<this.height;j++)
                {
                    //copy over data if it exists, otherwise it's empty
                    nextCells[i][j] = prevHeight && prevWidth && prevHeight<i && prevWidth<j ? this.cells[i][j] : 'offline';
                }

                //allocate handles for the svg elements
                this.lineElementHandles[i] = new Array(this.height * 3); //each dot has three lines
                this.dotElementHandles[i] = new Array(this.height);
            }
            this.cells = nextCells;

            //build the display
            for(let j=0; j<this.height;j++)
            {
                const y = this.margins.height + (j*this.CELL_HEIGHT);
                for(let i=0; i<this.width;i++)
                {
                    const x = this.margins.width + ((i)*this.CELL_WIDTH) + (j%2===0 ? 0 : this.CELL_WIDTH/2); //x pos of cell

                    //create the new dot display element.
                    //this must be before after the lines, as SVG element layering is based on order in the document, and dots should be above lines
                    this.dotElementHandles[i][j] = this.addCircleToCanvas(
                        x, y,
                        this.DOT_RADIUS,
                        this.DOT_FILL_COLOR, this.DOT_FILL_OPACITY,
                        dots
                    );

                    //create the line display elements. but don't create elements that would extend off the edge of the grid
                    //first create the link channel (the thin grey lines that are always on)
                    //then create the active link (the thick blue lines that flicker)

                    if(this.hasRLink(i,j)) { //the last cell in each row doesn't have a next cell
                        this.addLineToCanvas(
                            x, y, 
                            x + this.CELL_WIDTH, y,
                            this.LINK_CHANNEL_COLOR, this.LINK_CHANNEL_WIDTH, this.LINK_CHANNEL_OPACITY,
                            undefined,
                            channels
                        );

                        this.lineElementHandles[i][(j*3)] = this.addLineToCanvas(
                            x, y, 
                            x + this.CELL_WIDTH, y,
                            this.ACTIVE_LINK_COLOR, this.ACTIVE_LINK_WIDTH, this.ACTIVE_LINK_OPACITY,
                            'hidden',
                            links
                        );
                    }
                    if(this.hasBLLink(i,j))
                    {
                        //bottom left
                        this.addLineToCanvas(
                            x, y,
                            x - (this.CELL_WIDTH/2), y + this.CELL_HEIGHT,
                            this.LINK_CHANNEL_COLOR, this.LINK_CHANNEL_WIDTH, this.LINK_CHANNEL_OPACITY,
                            undefined,
                            channels
                        );
                        //bottom left
                        this.lineElementHandles[i][(j*3)+1] = this.addLineToCanvas(
                            x, y,
                            x - (this.CELL_WIDTH/2), y + this.CELL_HEIGHT,
                            this.ACTIVE_LINK_COLOR, this.ACTIVE_LINK_WIDTH, this.ACTIVE_LINK_OPACITY,
                            'hidden',
                            links
                        );
                    }
                    // bottom right
                    if(this.hasBRLink(i,j)) { //the last cell in each row only has a bottom-right link on alternating rows, and the last row never does
                        this.addLineToCanvas(
                            x, y,
                            x + (this.CELL_WIDTH/2), y+this.CELL_HEIGHT,
                            this.LINK_CHANNEL_COLOR, this.LINK_CHANNEL_WIDTH, this.LINK_CHANNEL_OPACITY,
                            undefined,
                            channels
                        );
                        this.lineElementHandles[i][(j*3)+2] = this.addLineToCanvas(
                            x, y,
                            x + (this.CELL_WIDTH/2), y+this.CELL_HEIGHT,
                            this.ACTIVE_LINK_COLOR, this.ACTIVE_LINK_WIDTH, this.ACTIVE_LINK_OPACITY,
                            'hidden',
                            links
                        );
                    }
                }
            }
        }
    }
    hasRLink = (i,_=undefined) => i<this.width-1; //the last cell in each row doesn't have a next cell
    hasBLLink = (i,j) => (i!==0 || j%2 != 0) && j<this.height-1; //the first cell in each row only has a bottom-left link on alternating rows, and the last row never does
    hasBRLink = (i,j) => (i!==this.width-1 || j%2 == 0) && j<this.height-1; //the last cell in each row only has a bottom-right link on alternating rows, and the last row never does
    /**
     * Update the look of the this.canvas to match the state of this.cells.
     */
    updateView()
    {
        for(let j=0; j<this.height;j++)
        {
            for(let i=0; i<this.width;i++)
            {
                //draw the linking line if both cells are on
                if(this.cells[i][j]==='online') //if this cell is off we don't need to check any neighbours
                {
                    if(this.hasRLink(i,j)) { 
                        this.lineElementHandles[i][(j*3)].setAttribute('visibility', this.cells[i+1][j]==='online' ? 'visible' : 'hidden');
                    }
                    if(this.hasBLLink(i,j)) {
                        this.lineElementHandles[i][(j*3)+1].setAttribute('visibility', 
                        (
                            (j%2!==0 && this.cells[i][j+1]==='online') || 
                            (i>0 && this.cells[i-1][j+1]==='online')
                        ) ? 'visible' : 'hidden');
                    }
                    if(this.hasBRLink(i,j)) { 
                        this.lineElementHandles[i][(j*3)+2].setAttribute('visibility',
                        (
                            (j%2===0 && this.cells[i][j+1]==='online') || 
                            (i<this.width-1 && this.cells[i+1][j+1]==='online')
                        ) ? 'visible' : 'hidden');   
                    }
                }
                else {
                    if(this.hasRLink(i,j)) {
                        this.lineElementHandles[i][(j*3)].setAttribute('visibility', 'hidden');
                    }
                    if(this.hasBLLink(i,j)) {
                        this.lineElementHandles[i][(j*3)+1].setAttribute('visibility', 'hidden');
                    }
                    if(this.hasBRLink(i,j)) {
                        this.lineElementHandles[i][(j*3)+2].setAttribute('visibility', 'hidden');
                    }
                }
            }   
        }
    }
    /**
     * reset the automata to a random state
     */
    reset()
    {
        //initialize with a random state
        for(let i=0; i<this.width;i++)
        {
            this.cells[i] = [];
            for(let j=0; j<this.height;j++)
            {
                this.cells[i][j] = Math.floor(Math.random() * 4) === 1 ? 'online' : 'offline';
            }
        }
    }
    /**
     * Update this.cells to a successor state of its current value.
     */
    advance()
    {
        let noChange = true;
        const nextCells = [];
        for(let i=0; i<this.width;i++)
        {
            nextCells[i] = this.cells[i];
            for(let j=0; j<this.height;j++)
            {
                let nNeighbours = 0;
                switch (this.cells[i][j])
                {
                    case 'online':
                        if(i>0 && j<this.height-1 && this.cells[i-1][j+1]==='online')//topleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j<this.height-1 && this.cells[i+1][j+1]==='online')//topright
                        {
                            nNeighbours++;
                        }
                        if(i>0 && this.cells[i-1][j]==='online')//left
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && this.cells[i+1][j]==='online')//right
                        {
                            nNeighbours++;
                        }
                        if(i>0 && j>0 && this.cells[i-1][j-1]==='online')//botleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j>0 && this.width-1>this.cells[i+1][j-1]==='online')//botright
                        {
                            nNeighbours++;
                        }

                        if(Math.floor(Math.random() * 100)<=5*nNeighbours)
                        {
                            nextCells[i][j] = new Recovering(10);
                            noChange = false;
                        }
                        else
                        {
                            nextCells[i][j] = this.cells[i][j];
                        }
                        break;
                    case 'offline':
                        //the grid is isomorphic to a square, look at the zigzagging vertical columns and imagine straightening them out.
                        //it's connected like an eight cell neighbourhood, but missing the top left and bottom left cells.  
                        //count neighbours
                    
                        if(i>0 && j<this.height-1 && this.cells[i-1][j+1]==='online')//topleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j<this.height-1 && this.cells[i+1][j+1]==='online')//topright
                        {
                            nNeighbours++;
                        }
                        if(i>0 && this.cells[i-1][j]==='online')//left
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && this.cells[i+1][j]==='online')//right
                        {
                            nNeighbours++;
                        }
                        if(i>0 && j>0 && this.cells[i-1][j-1]==='online')//botleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j>0 && this.width-1>this.cells[i+1][j-1]==='online')//botright
                        {
                            nNeighbours++;
                        }
                        
                        if(nNeighbours>=1)
                        {
                            if(Math.floor(Math.random() * 100)<=10*nNeighbours)
                            {
                                nextCells[i][j] = 'online';
                                noChange = false;
                            }
                            else
                            {
                                nextCells[i][j] = this.cells[i][j];
                            }
                        }

                        break;
                    default: //recovering
                        if(this.cells[i][j] instanceof Recovering)
                        {
                            nextCells[i][j]= this.cells[i][j].next();
                            noChange = false;    
                        }
                }
            }
        }
        this.cells = nextCells;
        
        //reset the automaton if there's somehow no activity
        if(noChange) 
        {
            this.reset();
        }
    }
    addLineToCanvas(x1,y1, x2,y2, color, width = 1, opacity=1, visibility='visible', container=this.CANVAS) {
        //create the element
        const line = document.createElementNS(this.CANVAS.namespaceURI, 'line');
        //add it to the SVG
        
        //set attributes
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-opacity', opacity);
        line.setAttribute('stroke-width', width);
        line.setAttribute('visibility', visibility);
        
        line.setAttribute('shape-rendering', 'geometricPrecision');
        line.setAttribute('stroke-linecap','round');

        container.appendChild(line);
        return line;
    }
    addCircleToCanvas(x,y, radius, fillColor, fillOpacity=1, container=this.CANVAS) {
        //create the element
        const circle = document.createElementNS(this.CANVAS.namespaceURI, 'circle');
        //add it to the SVG
        container.appendChild(circle);
        
        //set attributes
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', fillColor);
        circle.setAttribute('fill-opacity', fillOpacity);

        circle.setAttribute('shape-rendering', 'geometricPrecision');

        return circle;
    }
    /**
     * Advance this Automata's state and update the canvas.
     */
    tick() {
        this.advance();
        this.updateView();
    }

    /**
     * Start this Automata if it is not running, otherwise does nothing.
     */
    start() {
        if(this.tickIntervalID === undefined) {
            this.resize();
            this.tick();
            this.tickIntervalID = setInterval(this.tick.bind(this), 250); 
        }
    }
    /**
     * Stop this Automata if it is running, otherwise does nothing.
     */
    stop() {
        if(this.tickIntervalID) {
            clearInterval(this.tickIntervalID);
            this.tickIntervalID === undefined;
        }
    }
}

//disable noJS placeholder
document.body.style['background-image'] = 'none';

//set up canvas and automata
const isPortrait = window.matchMedia('(orientation: portrait)').matches;
const svgCanvas = document.getElementById('cellular-canvas');
const automata = new Automata(
    document.body.offsetWidth / (isPortrait ? 8 : 30), 
    svgCanvas
);
automata.start();

const resizeAll = () => {
    svgCanvas.style.height = document.body.scrollHeight;
    automata.resize();
};
window.addEventListener('resize', resizeAll);

/**
// logic for the 'stop background' button (disabled)
const buttonKillBackground = document.getElementById('button-kill-background');
buttonKillBackground.flipsideTextContent = 'Start Background';
buttonKillBackground.addEventListener('click', () => {
    const temp = buttonKillBackground.textContent;
    buttonKillBackground.textContent = buttonKillBackground.flipsideTextContent;
    buttonKillBackground.flipsideTextContent = temp;
    
    if(repeatDrawEventID===null)
    {
        repeatDrawEventID = setInterval(draw, 250);
        document.querySelectorAll('.suppressed-spin').forEach((x) => {
            x.classList.add('spin');
            x.classList.remove('suppressed-spin');
        });
    }
    else
    {
        clearInterval(repeatDrawEventID);
        document.querySelectorAll('.spin').forEach((x) => {
            x.classList.remove('spin');
            x.classList.add('suppressed-spin');
        });
        repeatDrawEventID = null;
    }
});
 */

//set up on hover color change for the github logo
const gitHubLink = document.getElementById('github-link');
const gitHubLogo = document.getElementById('github-logo');
gitHubLink.addEventListener('mouseenter', () => gitHubLogo.src = 'asset/GitHub_Lockup_Dark_OnHover.png');
gitHubLink.addEventListener('mouseleave', () => gitHubLogo.src = 'asset/GitHub_Lockup_Dark.png');


//set up listener to enable secret title if it's after 3am
const witchTitle = document.getElementById('witch-title');
function calcIsWitchingHours()
{
    const thisHour = new Date().getHours();
    return (thisHour>=3 && thisHour<6);
}

let lastWitchCheck = calcIsWitchingHours();
witchTitle.hidden = !lastWitchCheck;
setInterval(() => {
    const isWitchingHours = calcIsWitchingHours();
    //it appears and disappears gradually
    
    if(isWitchingHours!=lastWitchCheck) //if it changed
    {
        if(isWitchingHours)
        {
            witchTitle.hidden = false;
            witchTitle.classList.remove('fade-out');
            witchTitle.classList.add('fade-in');
        }
        else
        {
            witchTitle.classList.remove('fade-in');
            witchTitle.classList.add('fade-out');
            setTimeout(()=>witchTitle.hidden = true, 21000);
        }   
    }
    lastWitchCheck = isWitchingHours;

}, 60000); //every minute