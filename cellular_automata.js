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

class Automata {
    constructor(width, height, margin, scale)
    {
        this.width = width;
        this.height = height;

        this.margin = margin;
        this.scale = scale;

        this.data = [];

        this.reset();
        //find the vertical height of the triangle with side length this.scale
        this.verticalHeight = Math.sqrt(this.scale**2 - (this.scale/2)**2);
        //hyp = sqr(l**2 + (l/2)**2)
        //l = sqr(hyp**2 - (l/2)**2)
    }
    reset()
    {
        //initialize with a random state
        for(let i=0; i<this.width;i++)
        {
            this.data[i] = [];
            for(let j=0; j<this.height;j++)
            {
                this.data[i][j] = false;
                this.data[i][j] = Math.floor(Math.random() * 4) === 1 ? "online" : "offline";
                //1-in-10 chance of being live
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
        
        if(noChange) 
        {
            this.reset();
        }
    }

    advanceConway()
    {
        let noChange = true;
        for(let i=1; i<this.width-1;i++)
        {
            for(let j=1; j<this.height-1;j++)
            {
                //count neighbours
                let nNeighbours = 0;
                if(this.data[i-1][j+1])//topleft
                {
                    nNeighbours++;
                }
                if(this.data[i+1][j+1])//topright
                {
                    nNeighbours++;
                }
                if(this.data[i-1][j])//left
                {
                    nNeighbours++;
                }
                if(this.data[i+1][j])//right
                {
                    nNeighbours++;
                }
                if(this.data[i-1][j-1])//botleft
                {
                    nNeighbours++;
                }
                if(this.data[i+1][j-1])//botright
                {
                    nNeighbours++;
                }
                
                //logic
                if(this.data[i][j] && nNeighbours<2)
                {
                    this.data[i][j] = false;
                    noChange = false;
                }
                else if(this.data[i][j] && nNeighbours>3)
                {
                    this.data[i][j] = false;
                    noChange = false;  
                }
                else if(!this.data[i][j] && nNeighbours===3)
                {
                    this.data[i][j] = true;  
                    noChange = false; 
                }
            }
        }

        if(noChange) 
        {
            console.log("reset");
            this.reset();
        }
        else
        {
            console.log("advance");
        }
    }
    draw(ctx)
    {
        ctx.fillStyle = "#0E0067";
        ctx.strokeStyle = "#0026FFC0";

        for(let j=0; j<this.height;j++)
        {
            const point = [undefined, (this.margin*this.scale)+(j*this.verticalHeight)];
            for(let i=0; i<this.width;i++)
            {
                //dots
                point[0] = (this.margin*this.scale)+(i*this.scale) + (j%2===0 ? this.scale/4 : -this.scale/4);

                //lines (cell contents)
                //every other cell, look at the neighbours in the bottom-right half, these haven't been processed yet.
                //draw the linking line if both cells are On
                if(this.data[i][j]==="online") //and this cell on
                {
                    //next in this row
                    if(i<this.width-1 && this.data[i+1][j]==="online")
                    {
                        
                        ctx.beginPath();
                        ctx.moveTo(point[0], point[1]);
                        ctx.lineTo(
                            point[0] + this.scale,
                            point[1]);
                        ctx.stroke();
                    }

                    //bottom left
                    if(j<this.height-1 && ((j%2===0 && this.data[i][j+1]==="online") || (i>0 && this.data[i-1][j+1]==="online")))
                    {
                        ctx.beginPath();
                        ctx.moveTo(point[0], point[1]);
                        ctx.lineTo(
                            point[0] - (this.scale/2),
                            point[1]+this.verticalHeight
                        );
                        ctx.stroke();
                    }
                    
                    //bottom right
                    if(j<this.height-1 && ((j%2!=0 && this.data[i][j+1]==="online") || (i<this.width-1 && this.data[i+1][j+1]==="online")))
                    {
                        ctx.beginPath();
                        ctx.moveTo(point[0], point[1]);
                        ctx.lineTo(
                            point[0] + this.scale/2,
                            point[1]+this.verticalHeight
                        );
                        ctx.stroke();
                    }
                }
                //draw dot
                ctx.beginPath();
                ctx.arc(
                    point[0],
                    point[1],
                    
                    this.scale * .05, 0, 2 * Math.PI);
                ctx.fill();
            }   
        }
    }
}

//set up canvas and automata
const canvas = document.getElementById("cellular-canvas");
const context = canvas.getContext("2d");
const automata = new Automata(
    26,18, //should be based on screen aspect ratio
    
    .5,75
);

//function to resize the canvas to fit the screen, advance and draw the automata
function resize()
{
    //set to zero first so the previous size doesn't contribute to the scroll h/w
    canvas.width = 0;
    canvas.height = 0;

    canvas.height = document.documentElement.scrollHeight;
    canvas.width = document.documentElement.scrollWidth;

    automata.scale = (canvas.width / automata.width);
}
function draw()
{
    resize();
    automata.advance();
    automata.draw(context);
}

//disable noJS placeholder
document.querySelector("body").style["background-image"] = "none";

draw();
window.setInterval(draw, 250);
window.addEventListener("onresize", () => {
    resize();
})

document.getElementById("button-kill-cellular-automata");