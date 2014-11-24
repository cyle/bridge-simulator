# starship bridge simulator game, by cylesoft

## whaaaat?

You heard me. This is a cooperative starship bridge simulator game, like [Artemis](http://www.artemis.eochu.com/), except maybe better looking and browser-based. You can't play this on your own; you need at least two other people to play this effectively. At least, that's the plan.

## usage

- use Terminal on a mac
- you need node.js 0.10+ installed
- install required modules express and socket.io by doing a `npm install` in the game directory
- run the server by running `node bridge-server.js`
- players can open up `http://your-ip:33333/` in a browser and start playing

## ideas / notes / to-dos

- browser-based
	- responsive-designed consoles, friendly from desktop to mobile
	- charts with c3.js? http://c3js.org/
	- Two.js vector drawings? http://jonobr1.github.io/two.js/
	- control panels...
		- NexusUI http://www.nexusosc.com/nexusTutorials/
		- KievII http://kievii.net/
- different stations for each player
	- helm: drives the ship, sets course and speed, basic map
	- weapons: fires weapons, set weapon power levels, target locks
	- communications/ops: hails, diplomacy, basic sensors, decoding
	- captain: better dashboard, can set yellow/red alert
	- science: scans, probes, advanced sensors, environmental controls
	- engineering: sets power levels, what's fixed next
- if fewer than six people, you can double-duty stations:
	- helm/weapons
	- comm/captain
	- engineering/science
- all stations have a basic at-a-glance dashboard
	- current ship hull points / shields
	- current ship energy usage / max
	- who's at what station? player list?
	- unique name of your instance?
- SpaceTeam-like random events at terminals
	- fix the inverse power coupling!
- pick your starting ship...
	- some are warships, some are general, some are science-y vessels
	- or randomize!
- pick your mission/episode...
	- or randomize!
	- or simply "play now"
- ranks / experience points / achievements
	- more you play, more XP you get, special abilities as you rank up
	- ensign -> lieutenant jr -> lieutenant -> lieutenant commander -> commander -> captain
	- commodore -> rear admiral -> vice admiral -> admiral -> fleet admiral