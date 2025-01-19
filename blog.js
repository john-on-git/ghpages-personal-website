//make a request to article index
//will have to store offset state somewhere
//maybe this should be object-oriented

const API_LOCATION = "http://TODO.com";

function recursiveSetVisibility(node, bool) {
    node.hidden = !bool;
    for(let i=0;i<node.children.length;i++) { //doesn't work with foreach (bc it makes a copy?)
        recursiveSetVisibility(node.children[i], bool);
    }
}
//all data/logic for drawing index view
const index = {
    endpoint: API_LOCATION+"/article/index",
    articlesPerPage: 12,
    
    root: document.getElementById("article-index"),
    grid: document.getElementById("article-grid"),
    errorDisplay: document.getElementById("title-fetch-error"),
    buttonPrev: document.getElementById("index-prev"),
    buttonNext: document.getElementById("index-next"),
    noArticles: document.getElementById("no-articles"),
    
    async use(offset) {
        //show index, hide details
        recursiveSetVisibility(this.root, true);
        this.root.style.display = "block";
        
        recursiveSetVisibility(details.root, false);
        details.root.style.display = "none";
    
        //destroy any old aricles on the grid
        while(this.grid.firstChild!==null) {    
            this.grid.removeChild(this.grid.firstChild);
        }
    
        try {
            const url = typeof(offset)===Number ? this.endpoint : this.endpoint+"?offset="+offset; 
            const response = await fetch(url);
            if(response.ok) {
                recursiveSetVisibility(this.errorDisplay, false);
                const articles = await response.json();
                for(let i = 0;i<articles.length;i++) {            
                    //construct snippet for article
                    const snippet = document.createElement("button");
                    snippet.addEventListener("click", async () => {
                        window.history.replaceState(
                            null,
                            "",
                            "blog.html?id="+articles[i].id +
                            (offset===null || offset===0 ? "" : "&offset="+offset)
                        );
                        updateView();
                    });
                    
                    const title = document.createElement("h2");
                    title.innerText = articles[i].title;
                    snippet.appendChild(title);
        
                    const authors = document.createElement("p");
                    authors.innerText = "by " + articles[i].authors;
                    snippet.appendChild(authors);
                    
                    const postedAt = document.createElement("p");
                    postedAt.innerText = articles[i].postedAt.substring(0,10);
                    snippet.appendChild(postedAt);
        
                    this.grid.appendChild(snippet);
                }
        
                //update the view once everything's had time to load
        
                if((offset===null || offset===0) && articles.length===0) {
                    recursiveSetVisibility(this.noArticles, true);
                    this.noArticles.style.display = "block";
                }
                else {
                    
                    recursiveSetVisibility(this.noArticles, false);
                    this.noArticles.style.display = "none";
                }

                //hide buttons
                //if on first page, hide prev
                if(offset<=0) {
                    recursiveSetVisibility(this.buttonPrev, false);
                    this.buttonPrev.style.display = "none";
                }
                else {
                    recursiveSetVisibility(this.buttonPrev, true);
                    this.buttonPrev.style.display = "block";
                }
                //if this is the last page (no more results), hide next
                if(articles.length<this.articlesPerPage)
                {
                    recursiveSetVisibility(this.buttonNext, false);
                    this.buttonNext.style.display = "none";
                }
                else
                {
                    recursiveSetVisibility(this.buttonPrev, true);
                    this.buttonNext.style.display = "block";
                }
            }
            else {
                throw new Error(response.status);
            }
        }
        catch(e) {
            console.error("Blog: failed fetching articles.", e);
            recursiveSetVisibility(this.errorDisplay, true);
            this.errorDisplay.style.display = "block";
            
            recursiveSetVisibility(this.root, false);
            this.root.style.display = "none";
        }
    }
}

//all data/logic for drawing details view
const details = {
    endpoint: API_LOCATION+"/article/details?id=",

    root: document.getElementById("article-details"),
    title: document.getElementById("article-details-title"),
    authors: document.getElementById("article-details-authors"),
    postedAt: document.getElementById("article-details-posted-at"),
    snippetContainer: document.getElementById("article-details-snippet-container"),
    
    async use(id) {
        const url = this.endpoint + id; 
        try {
            const response = await fetch(url);
            if(response.ok) {
                const article = await response.json();
                
                //update details elements with data
                this.title.innerText = article.title;
                this.authors.innerText = article.authors;
                this.postedAt.innerText = article.postedAt.substring(0,10);
                this.snippetContainer.innerHTML = article.htmlSnippet;
                
                //update the view once everything's had time to load
                
                //hide index
                recursiveSetVisibility(index.root, false);
                index.root.style.display = "none";
        
                //show details
                recursiveSetVisibility(details.root, true);
                this.root.style.display = "block";
            }
            else {
                throw new Error(response.status);
            }
        }
        catch(e) {
            console.error("Blog: failed fetching article.", e);
            recursiveSetVisibility(this.root.errorDisplay, true);
            this.root.errorDisplay.style.display = "block";
        }
    }
};


//this function sets view state to correspond to state object above
async function updateView() {
    const url = new URLSearchParams(window.location.search);
    const currentArticle = url.get("id");
    let offset = url.get("offset");
    offset = offset===null ? 0 : parseInt(offset);

    if(currentArticle===null) {
        await index.use(offset);
    }
    else {
        await details.use(currentArticle);
    }
    setTimeout(resizeAll, 250);
}

//set up button event listeners
document.getElementById("button-article-details-back").addEventListener(
    "click",
    () => {
        const url = new URLSearchParams(window.location.search);
        let offset = url.get("offset");
        console.log("btnback",offset);
        offset = offset===null ? 0 : parseInt(offset);

        console.log("btnback",offset);
        window.history.replaceState( //navigate back to main
            null,
            "",
            "blog.html" + 
            ((offset===null || offset===0) ? "" : "?offset="+offset)
        );
        updateView(); //redraw view
    }
);
document.getElementById("index-prev").addEventListener(
    "click",
    () => {
        const url = new URLSearchParams(window.location.search);
        let offset = url.get("offset");
        offset = offset===null ? 0 : parseInt(offset);

        window.history.replaceState( //navigate back to main
            null,
            "",
            "blog.html"+ (offset==1 ? "" : "?offset="+(offset-1))
        );
        updateView(); //redraw view
    }
);
document.getElementById("index-next").addEventListener(
    "click",
    () => {
        const url = new URLSearchParams(window.location.search);
        let offset = url.get("offset");
        offset = offset===null ? 0 : parseInt(offset);

        window.history.replaceState( //navigate back to main
            null,
            "",
            "blog.html?offset=" + (offset+1)
        );
        updateView(); //redraw view
    }
);
updateView();