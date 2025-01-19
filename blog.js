//make a request to article index
//will have to store offset state somewhere

const home = "http://localhost:8080";
const indexArticles = home+"/article/index";

const articleGrid = document.getElementById("grid-articles");
const fetchErrorDisplay = document.getElementById("title-fetch-error");

//TODO doesn't work because I need to set up CORS policy

//run when click forward/back

function recursiveSetVisibility(node, bool)
{
    node.hidden = bool;
    for(let i=0;i<node.children.length;i++) //doesn't work with foreach (bc it makes a copy?)
    {
        recursiveSetVisibility(node.children[i], bool);
    }
}


async function getArticles(offset)
{
    //TODO clear all the old articles currently on page
    while(articleGrid.firstChild!==null)
    {    
        articleGrid.removeChild(articleGrid.firstChild);
    }

    const url = typeof(offset)===Number ? indexArticles : indexArticles+"?offset="+offset; 
    const response = await fetch(url);
    if(response.ok)
    {
        recursiveSetVisibility(fetchErrorDisplay, true);
        const articles = await response.json();
        for(let article in articles)
        {
            //maintain a set of articles that have already been fetched
            
            //construct snippet for article
            const fragment = document.createElement("div");
            
            const title = document.createElement("p");
            title.innerText = article.title;
            fragment.appendChild(title);

            const authors = document.createElement("p");
            authors.innerText = "by " + article.title;
            fragment.appendChild(authors);
            
            const postedAt = document.createElement("p");
            postedAt.innerText = article.title;
            fragment.appendChild(postedAt);

            articleGrid.appendChild(fragment);
        }
    }
    else
    {
        console.error("Blog: failed fetching articles.", response.status);
        recursiveSetVisibility(fetchErrorDisplay, false);
    }
}

getArticles(0);