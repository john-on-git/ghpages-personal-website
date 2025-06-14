+ Want to make it w/ ReactJS, backend using Ajax calls to microservices.
+ Plan Steps.
	1. Requirements, User Stories, design mockups.
	2. Static web page mockups.

1. Requirements, User Stories, Design Mockups.
	+ There are two groups in the target audiences:
		1. HR People/Recruiters. These are the most important, I want people to see linked this on my CV & Linkedin, and be impressed.
			+ I'm just taking in the vibe to see if the site looks interesting, impressive, and professional.
			+ I want to find out if John has experience with a particular technology.
			+ I want to see if he has good taste 💀
		2. Peers. My friends/other coders. I'll definitely end up talking to them about it too.
			+ I want to know what technologies the site used.

	+ Requirements.
		+ Y2K Aesthetic. 
			+ I'm not sure if this fits the tone, but I really dig it.
			+ Some of the website I've seen have been very silly, so it should be fine.
		+ Professional writing tone.
		+ Main page repeating info from CV.
		+ Interactive demonstration of other projects.
		+ Proper security practices
		
		+ I want some arcane looking sigils. Cellular automata!

		+ Blog.
			+ Alright, set up the backend and the schema. I know what to do for that, barring some minor decisions.
			  Once it's there, I'll think about using it. These things have momentum.
			+ Schema?
				ID :: autoint
				Title :: varchar
				Authors :: varchar
				snippet :: varchar
				
			+ API
				+ GET articles
					+ Params:
						+ offset :: number //skip this many articles
					+ return :: [{id::number, title::string, authors::string, preview::string}]
				+ GET article
					+ Params:
						+ id :: number //id of the article to retrieve
					+ return :: {title::string, authors::string, preview::string}
			+ If I'm gonna do a preview, maybe it should just be the first element.
			+ Since this is gonna be public, I want to lock it down and make sure data is only going out, minimise injection opportunities.
			+ Really need to make sure it's up to best practices on JS injection attacks as well.
			+ Options are... Python Flask/Django, C# Asp.Net, could use Java. I think C# is the move because I don't have any projects with it right now.
DONE
	+ Figure out why the sidebar is slightly longer than the pale sheet and make it not be.
		+ height: fit-content
BUGS
	+ It's possible to error out the blog and put the UI in an invalid state by spamming the buttons to go in and out of an article. 
TODO
	+ cache articles locally to speed up the loading
	+ layout doesn't work well on portrait screens, very long vertical columns look silly
		+ Swap out for an alternative layout with JS?
	+ where should I host images? ohhh why didn't I think of this
	+ mitigate canvas flicker on article load https://stackoverflow.com/questions/15799564/flickering-during-resizing-of-html5-canvas
	+ sidebar/pale-sheet height is still broken: check Galaxy S20 horizontal (ehh kinda)
	+ Make sure it's all accessible, disability compliant.
	+ Font Awesome SVG icons for symbols?