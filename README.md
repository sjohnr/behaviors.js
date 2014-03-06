behaviors.js
============

A library for implementing Behaviors Stylesheets (BSS) for attaching behaviors to pages with unobtrusive JavaScript. This library is based on the work of Dan Yoder in the Cruiser.Behaviors library, which was inspired by Ben Nolan's own Behaviours library.

**Note:** The following was adapted from [this wiki page](https://code.google.com/p/cruiser/wiki/Behaviors)

Introduction
============

Our Behaviors library was originally inspired by Ben Nolan’s Behaviours library. Basically, the idea is to use CSS selectors to “decorate” DOM elements with Javascript handlers and the like.

We took the idea a step farther and pulled them out into a separate file, called a behaviors stylesheet (BSS). This is a stylesheet, using the same syntax as CSS, that includes a variety of attributes to support DOM decoration.

For example, you can add a mouseover handler to show a preview window for all links marked with the preview class like this:

```javascript
a.preview { mouseover: preview; }
```

The benefit of using BSS is two-fold:

* Your Javascript can now focus more or less on the interfaces you want your DOM elements to support. You don’t need to clutter up your Javascript with the mappings between elements and methods / functions. 
* You can push out design-centric Javascript to the designer. In the ‘preview’ example above, you can let the CSS designer decide which links should provide a preview, rather than embedding that in your Javascript. 

Usage
=====

behaviors.js uses [prototype.js](http://prototypejs.org/) 1.6+. Include it in the head of your page, along with [parser-generator.js](https://github.com/sjohnr/parser-generator.js) as follows:

```html
<script src="https://ajax.googleapis.com/ajax/libs/prototype/1.7.1.0/prototype.js"></script>
<script src="https://raw.github.com/sjohnr/parser-generator.js/master/parsing.js"></script>
<script src="https://raw.github.com/sjohnr/behaviors.js/master/behaviors.js"></script>
```

You can load a BSS file pretty much the same way you load a CSS file: with a `<link>` tag. For example:

```html
<link rel="behaviors" href="my-behaviors.bss">
```

Attributes
==========

Binding Attribute
-----------------

Binds the element to another element via a binding function. Event handling will be delegated to the bound element.

```javascript
// create a submit button
a.save { binding: up(form); click: submit; }

// tabbed dialog
div.tabs { binding: new( TabControl ) }
a.tab { binding: up( div.tabs ); click: select }
```

**Binding functions:**

* `new( class )` 
  * Binds to the result of instantiating a new instance of the given class.
  * Constructor is passed the original element.
* `object( object )`
  * Binds to the given object.
* `up( selector )`
  * Binds to the first ancestor element matching the given selector.
* `down( selector )`
  * Binds to the first descendant element matching the given selector.
* `next( selector )`
  * Binds to the first sibling after the element that matches the given selector.
* `next( selector )`
  * Binds to the first sibling before the element that matches the given selector. 

Load Attribute
--------------

Calls a function when the element is loaded (actually at the point the attribute is processed). Passes the bound element to the function.

```javascript
a.menu-item { binding: object( MainMenu ); load: addMenuItem; }
```

**Note:** With binding and load, order does matter, since both attributes are processed as they are parsed. So if you are depending on the binding for your load method, make sure you put the binding attribute first.

Has-Focus Attribute
-------------------

Ensure that an element has focus on page load (as above, actually the point the attribute is processed).

```javascript
input.user-name { hasFocus: true; load: highlight; }
```

Event Attributes
----------------

Specifies the handler for the given event. The handler must be a method of the element. See binding to add methods to an element.

Possible events are `blur`, `change`, `click`, `dblclick`, `focus`, `keydown`, `keypress`, `keyup`, `mousedown`, `mousemove`, `mouseout`, `mouseover`, `mouseup`, and `resize`.

```javascript
a.preview { binding: new( Previewable ); click: preview; }
```

Relative Attributes
-------------------

Sets a given style attribute relative to another element’s value.

Possible attributes are `height` and `width`.

```javascript
// make sure the sidebar and body match
div.sidebar { height: minimum( div.body ) }
div.body { height: minimum( div.sidebar ) }
```

**Relative value functions:**

* `minimum ( selector )`
  * Make sure the element attribute is no less than the first element returned using the given selector.
* `maximum ( selector )`
  * Make sure the element attribute is no greater than the first element returned using the given selector.
* `equals ( selector )`
  * Make sure the element attribute is equal to the first element returned using the given selector. 

**Note:** Relative values only work when the values are independent of one another.

Extensibility
=============

It is straightforward to add new attributes. In fact, my hope is that people will contribute useful attributes that we can incorporate into the built-in attributes.

All you need to do is add a method to the hash Behaviors.Attributes and voila! instant attribute. The function you add should take three arguments: the element that the attribute is operating on, the value of the attribute, and the attribute name itself. (In most cases, you can ignore the third argument.)

```javascript
Behaviors.Attributes.myAttribute = function(el,val) { ... }
// later, inside the BSS file ...
div.foo { my-attribute: bar; }
```

The only rules are:

* Don’t use the name of an existing attribute (see above).
* Remember, val will be passed to you as a string. 