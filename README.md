backbone.grid (backbone.js grid)
=============

##Why
I'm always running into situations where I need a grid that can be bound to a backbone.js collection, but the options out there are generally too brittle to use. Or they don't come with enough features. Or they are too difficult to add features to, while being open to updates. I'm using this in a few projects I am working on with backbone.js, and this is a rewrite of the grids that I've used so far. 

I'm following a sort of 'mixin' pattern for adding new 'features' to the grid. Behaviors are passed to the grid constructor like so:

````javascript
new Grid({
	....
	behaviors: [
		{
			behavior: SomeBehaviorConstructor,
			options: {
				selection: 'multiple'
			}
		}
	],
	....
});
````

The behavior constructor is called on grid initialization, and then the grid tells the behavior what its grid actually is.. and that's it. From there on out, the grid goes about its business, while the behaviors help steer it in the right direction.

Examples can be found in the index.html file, which is currently the test playground.

The other reason behind this grid is its use of templates. I feel strongly that as little html/css as possible should be defined by the component. In any cases possible, I want to allow a user to be able to set a template to be used for representing any kind of data - be it a table row, an editor, the sortable headers, etc.

##Requires
- requirejs or another compatible module loader for dealing with dependencies (see demo/index.html)
- jQuery
- Backbone
- Underscore


TODO:
- Behaviors
    - Groupable
    - Editable
    - Scrollable (documentation, caveats)
    - Massive Scale (documentation)
    - Minimum Length
    - Selectable (documentation, selectable as checkboxes)