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
		+ Proper security practises 💀
		
		+ I want some arcane looking sigils. Cellular automata!
		
		+ Timeline? YOU ARE HERE.
		
		+ Cellular Automata.
			+ Grid shape?
				+ Initial doc has squares but the cells are actually cardinal+diagonal lines connecting the corners.
				+ Hexagons are the most futuristic so I should really consider them.
				  I'm not sure how lightningy this would look.
			+ Prototype 1:
				+ Just going to go for a square grid because it's the easiest: it can be implemented in pure HTML,
				  no WebGL canvas shenanigans.
					+ No, apparently this is way slower RIP.
				+ Description:
					+ The grid is 
					+ If there's an empty adjacent cell, fil it
			+ Changed my mind.
				+ Doing triangles was revealed to me in a dream.
				+ Tilt your head and imagine it like parallelograms.
				+ Each cell has 6 neighbors.
				+ Let's try implementing a basic one first, copy game of life and get a basic implementation,
				  before getting weird with some custom transition rules.


TODO
	Figure out why the sidebar is slightly longer than the pale sheet and make it not be.
		- height: fit-content
	
	sidebar/pale-sheet height is still broken: check Galaxy S20 horizontal