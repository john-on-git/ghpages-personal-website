const body = document.querySelector("body");

class Recovering {
    constructor(time)
    {
        this.time = time;
    }
    next()
    {
        if(this.time==0)
        {
            return "offline";
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
        this.scale = scale; //controls the size of the cells in pixels. should be inches to support high DPI displays, something for later
        this.margins = {"width": undefined, "height": undefined};
        this.canvas = canvas;

        this.data = [];
        this.verticalHeight = Math.sqrt(this.scale**2 - (this.scale/2)**2); //find the vertical height of the triangle with side length this.scale. Pythagoras we love you
        this.ctx = this.canvas.getContext("2d"); 

        this.resize();
    }
    
    //function to resize the canvas and automata to fit the screen
    resize()
    {
        //get the actual html display height of the canvas element

        //resize the resolution of the canvas to have the aspect ratio it's being displayed at, while maintaining a reasonable resolution
        this.canvas.style.width = body.offsetWidth + "px";
        this.canvas.style.height = body.offsetHeight + "px";

        //size the cellular automata grid to the display
        this.width = Math.floor(canvas.width / this.scale);
        this.height = Math.floor(canvas.height / this.verticalHeight); //should be based on screen aspect ratio

        //calculate margin size. the display is filled with as many cells as possible, then the margins are the remaining space
        this.margins.width = 100; //(2560 - ((this.width-.5) * this.scale))/2;
        this.margins.height = 100; //(1440 - (((this.height-1) * this.verticalHeight)))/2;
                
        //canvas config is reset upon resizing the canvas, so it must be set again
        this.ctx.lineWidth = 4;
        this.ctx.fillStyle = "#0E0067";
        this.ctx.strokeStyle = "#0026FFC0";

        this.reset(); //reset the automata logic because the size of the grid may have changed
    }
    reset()
    {
        //initialize with a random state
        for(let i=0; i<this.width;i++)
        {
            this.data[i] = [];
            for(let j=0; j<this.height;j++)
            {
                this.data[i][j] = Math.floor(Math.random() * 4) === 1 ? "online" : "offline";
            }
        }
    }
    advance()
    {
        let noChange = true;
        this.nextData = [];
        for(let i=0; i<this.width;i++)
        {
            this.nextData[i] = this.data[i];
            for(let j=0; j<this.height;j++)
            {
                let nNeighbours = 0;
                switch (this.data[i][j])
                {
                    case "online":
                        if(i>0 && j<this.height-1 && this.data[i-1][j+1]==="online")//topleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j<this.height-1 && this.data[i+1][j+1]==="online")//topright
                        {
                            nNeighbours++;
                        }
                        if(i>0 && this.data[i-1][j]==="online")//left
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && this.data[i+1][j]==="online")//right
                        {
                            nNeighbours++;
                        }
                        if(i>0 && j>0 && this.data[i-1][j-1]==="online")//botleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j>0 && this.width-1>this.data[i+1][j-1]==="online")//botright
                        {
                            nNeighbours++;
                        }

                        if(Math.floor(Math.random() * 100)<=5*nNeighbours)
                        {
                            this.nextData[i][j] = new Recovering(10);
                            noChange = false;1
                        }
                        else
                        {
                            this.nextData[i][j] = this.data[i][j];
                        }
                        break;
                    case "offline":
                        //the grid is isomorphic to a square, look at the zigzagging vertical columns and imagine straightening them out.
                        //it's connected like an eight cell neighbourhood, but missing the top left and bottom left cells.  
                        //count neighbours
                    
                        if(i>0 && j<this.height-1 && this.data[i-1][j+1]==="online")//topleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j<this.height-1 && this.data[i+1][j+1]==="online")//topright
                        {
                            nNeighbours++;
                        }
                        if(i>0 && this.data[i-1][j]==="online")//left
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && this.data[i+1][j]==="online")//right
                        {
                            nNeighbours++;
                        }
                        if(i>0 && j>0 && this.data[i-1][j-1]==="online")//botleft
                        {
                            nNeighbours++;
                        }
                        if(i<this.width-1 && j>0 && this.width-1>this.data[i+1][j-1]==="online")//botright
                        {
                            nNeighbours++;
                        }
                        
                        if(nNeighbours>=1)
                        {
                            if(Math.floor(Math.random() * 100)<=10*nNeighbours)
                            {
                                this.nextData[i][j] = "online";
                                noChange = false;
                            }
                            else
                            {
                                this.nextData[i][j] = this.data[i][j];
                            }
                        }

                        break;
                    default: //recovering
                        if(this.data[i][j] instanceof Recovering)
                        {
                            this.nextData[i][j]= this.data[i][j].next();
                            noChange = false;    
                        }
                }
            }
        }
        this.data = this.nextData;
        
        //reset the automaton if there's somehow no activity
        if(noChange) 
        {
            this.reset();
        }
    }
    draw()
    {
        this.ctx.clearRect(0,0, this.canvas.offsetWidth, this.canvas.offsetHeight);

        for(let j=0; j<this.height;j++)
        {
            const point = {
                "x": undefined,
                "y": this.margins.height + (j*this.verticalHeight)
            };
            for(let i=0; i<this.width;i++)
            {
                //dots
                point.x = this.margins.width + ((i)*this.scale) + (j%2===0 ? 0 : this.scale/2);

                //lines (cell contents)
                //every other cell, look at the neighbours in the bottom-right half, these haven't been processed yet.
                //draw the linking line if both cells are On
                if(this.data[i][j]==="online") //and this cell on
                {
                    //next in this row
                    if(i<this.width-1 && this.data[i+1][j]==="online")
                    {
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(point.x, point.y);
                        this.ctx.lineTo(
                            point.x + this.scale,
                            point.y);
                        this.ctx.stroke();
                    }

                    //bottom left
                    if(
                        j<this.height-1 && 
                        (
                            (j%2!==0 && this.data[i][j+1]==="online") || 
                            (i>0 && this.data[i-1][j+1]==="online")
                        )
                    )
                    {
                        this.ctx.beginPath();
                        this.ctx.moveTo(point.x, point.y);
                        this.ctx.lineTo(
                            point.x - (this.scale/2),
                            point.y+this.verticalHeight
                        );
                        this.ctx.stroke();
                    }
                    
                    //bottom right
                    if(
                        j<this.height-1 && 
                        (
                            (j%2===0 && this.data[i][j+1]==="online") || 
                            (i<this.width-1 && this.data[i+1][j+1]==="online")
                        )
                    )
                    {
                        this.ctx.beginPath();
                        this.ctx.moveTo(point.x, point.y);
                        this.ctx.lineTo(
                            point.x + (this.scale/2),
                            point.y+this.verticalHeight
                        );
                        this.ctx.stroke();
                    }
                }
                //draw dot
                this.ctx.beginPath();
                this.ctx.arc(
                    point.x,
                    point.y,
                    
                    this.scale * .05,
                    0,
                    2 * Math.PI
                );
                this.ctx.fill();
            }   
        }
    }
}

//disable noJS placeholder
body.style["background-image"] = "none";

//set up canvas and automata
const canvas = document.getElementById("cellular-canvas");
const automata = new Automata(
    100,
    canvas
);


//resize the sidebar with js. 
//after significant time-wasting, this doesn't seem to be possible with CSS for some reason :/
const sidebar = document.getElementById("sidebar");
const paleSheet = document.getElementById("pale-sheet");

function sidebarHeight()
{
    return paleSheet.offsetHeight + "px";
}
console.log(paleSheet.getBoundingClientRect());
console.log(paleSheet.offsetHeight);

sidebar.style.height = sidebarHeight();

//start drawing cellular automata
function draw()
{
    automata.advance();
    automata.draw();
}
draw();
window.addEventListener("resize", () => {
    sidebar.style.height = sidebarHeight();
    automata.resize();
});

//start/stop background
let repeatDrawEventID = setInterval(draw, 250);
/**
const buttonKillBackground = document.getElementById("button-kill-background");
buttonKillBackground.flipsideTextContent = "Start Background";
buttonKillBackground.addEventListener("click", () => {
    const temp = buttonKillBackground.textContent;
    buttonKillBackground.textContent = buttonKillBackground.flipsideTextContent;
    buttonKillBackground.flipsideTextContent = temp;
    
    if(repeatDrawEventID===null)
    {
        repeatDrawEventID = setInterval(draw, 250);
        document.querySelectorAll(".suppressed-spin").forEach((x) => {
            x.classList.add("spin");
            x.classList.remove("suppressed-spin");
        });
    }
    else
    {
        clearInterval(repeatDrawEventID);
        document.querySelectorAll(".spin").forEach((x) => {
            x.classList.remove("spin");
            x.classList.add("suppressed-spin");
        });
        repeatDrawEventID = null;
    }
});
 */

//set up on hover color change for the github logo
const gitHubLink = document.getElementById("github-link");
const gitHubLogo = document.getElementById("github-logo");
gitHubLink.addEventListener("mouseenter", () => gitHubLogo.src = "asset/GitHub_Lockup_Dark_OnHover.png");
gitHubLink.addEventListener("mouseleave", () => gitHubLogo.src = "asset/GitHub_Lockup_Dark.png");


//set up listener to enable secret title if it's after 3am
const witchTitle = document.getElementById("witch-title");
function calcIsWitchingHours()
{
    const thisHour = new Date().getHours();
    return (thisHour>=3 && thisHour<6);
}

let lastWitchCheck = calcIsWitchingHours();
witchTitle.hidden = !lastWitchCheck;
setInterval(() => {
    const isWitchingHours = !calcIsWitchingHours();
    //it appears and disappears gradually
    
    if(isWitchingHours!=lastWitchCheck) //if it changed
    {
        console.log("foo");
        if(isWitchingHours)
        {
            witchTitle.hidden = false;
            witchTitle.classList.remove("fade-out");
            witchTitle.classList.add("fade-in");
        }
        else
        {
            witchTitle.classList.remove("fade-in");
            witchTitle.classList.add("fade-out");
            setTimeout(()=>witchTitle.hidden = true, 21000);
        }   
    }
    lastWitchCheck = isWitchingHours;

}, 60000); //every minute