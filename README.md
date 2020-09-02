# Learn Component Architecture

It's easy to end up with a big mess of spaghetti code when working with the DOM. This workshop will cover some techniques for structuring your frontend code so that it's easier to work with and scale up to a larger app. It will also introduce common patterns that are used in frameworks like React.

## Setup

1. Clone this repo
1. `npm install`
1. `npm run dev`

Open http://localhost:8080 in your browser and you should see a basic counter. The `+` button makes the number go up by one each time you click it.

Open `workshop/counter.js` in your editor and read through the code. We'll be refactoring this in the next section.

## Modularisation

The code for our counter is a little unstructured. We have a bunch of variables all declared in the global scope. We're creating DOM elements and manipulating them all over the place. It's also not clear where elements actually gets added to the page, since this code is mixed in with everything else.

There's nothing _wrong_ with code like this, especially for something this simple. If you're never going to need to add any features, or have other people contribute, then it's fine to not have a clearly defined structure.

However there are a few things that will start to cause problems as the codebase grows and the code grows in complexity.

First all our variables are defined in the global scope. This isn't so bad with ES6, as `const` and `let` will prevent us from accidentally overwriting an existing variable name. It does make it more difficult to read and understand the code however, since everything is at the same level and has the same "importance". It's nice to have some level of grouping and organisation for different features.

Second none of this code is reusable. It all executes in order as soon as the script is included on an HTML page, and we have no control over it. For example what if we wanted to add a second counter to the page? Right now we'd need to copy/paste all this code (and change all the duplicate variable names so they don't clash).

### Components

Modern frontend codebases are often structured using _components_. A component is usually a chunk of code that represents a single feature. For example our counter could be thought of as a component: it's a chunk of code that renders a number and a button for incrementing that number.

JavaScript has a great tool for grouping code in a reusable way: functions. By putting code inside a function we hide it away from the rest of the JS in the file, and we can make the code run as many times as we like (by calling the function again and again).

### Challenge 1

1. Write a function named `Counter`
1. Move all DOM element creation and manipulation inside
1. Return the parent element that needs to be appended to the page
1. Call `Counter` and add the result to the page

Once you're done the counter on the page should work just like before.

<details>
<summary>Solution</summary>

```js
function Counter() {
  const view = document.createElement("span");
  view.append("0");

  const increment = document.createElement("button");
  increment.append("+");
  increment.onclick = () => {
    view.textContent = parseInt(view.textContent) + 1;
  };

  const container = document.createElement("div");
  container.append(view, increment);
  return container;
}

const app = document.querySelector("#app");

// Counter returns <div><span>0</span><button>+</button>
// we append those DOM nodes to the #app div to put them on the page
app.append(Counter());
```

</details>

## Reducing repetition

Our code is more structured and reusable, but it still has a lot of repeated operations. Creating DOM elements, assigning their properties and appending children is quite verbose, and requires multiple steps per element. E.g.

```js
const card = document.createElement("div");
const para = document.createElement("p");
para.id = "stuff";
para.append("hello");
card.append(para);
// <div><p id="stuff">hello</p></div>
```

We can use the `h` helper function from this [DOM rendering workshop](https://github.com/oliverjam/learn-dom-rendering) to make creating elements simpler. We call it with the tag name, an object of properties, and then any children. It returns the newly created DOM element. E.g.

```js
const card = h("div", {}, h("p", { id: "stuff" }, "hello"));
// <div><p id="stuff">hello</p></div>
```

This allows us to define complete elements in one go, and nest them inside each other similar to how we nest HTML.

### Challenge 2

1. Import the `h` function from `"./create-element.js"`
1. Refactor your `Counter` to use `h` to create all DOM elements

Your counter should keep working as before.

<details>
<summary>Solution</summary>

```js
function Counter() {
  const view = h("span", {}, "0");
  const inc = () => {
    view.textContent = parseInt(view.textContent) + 1;
  };
  const button = h("button", { onclick: inc }, "+");
  return h("div", {}, view, button);
}
```

</details>

## Managing updates

Right now our `Counter` function defines each element's _initial_ properties. It's then up to us to manage how those change over time. For example in our click handler we manually access and update the view's text content to increment the count.

This can get difficult to manage as you add features. For example what if our button needed to stop incrementing before the count hit 10? We'd need to set the `disabled` attribute so the user can't click the button anymore.

Our `Counter` function only runs once, when we add it to the page. The only code that runs multiple times is the click handler, so we need to change the button's properties in there.

```js
function Counter() {
  // ...
  const inc = (event) => {
    view.textContent = parseInt(view.textContent) + 1;
    if (parseInt(view.textContent) === 9) {
      event.target.disabled = true;
    }
  };
  // ...
}
```

This is starting to get messy again. We have to keep track of all the different things that should change for each update, and manually keep the DOM in sync ourselves.

It would be nice if we could _describe_ the UI that we want based on the state of the app at any given time. For example:

```js
function Counter() {
  // ...
  const button = h("button", { onclick: inc, disabled: count === 9 }, "+");
  // ...
}
```

This is a much simpler way to manage updates. To quote the React docs:

> thinking about how the UI should look at any given moment, rather than how to change it over time, eliminates a whole class of bugs

### Re-rendering components

In order for this to work our component function needs to re-run whenever an update happens. That way we recreate our DOM elements based on the current up-to-date value of the count. To make this work we need to restructure our app a bit.

First we need to identify what values are actually _stateful_. This means which values change over time that we need to keep track of. Right now this is just the count: it's the only thing that changes.

We currently keep track of this value in the DOM—it's stored as the `textContent` of the `view` element. We read it from there when we need to access it. However it would be easier for us if it was stored as a JS variable that our components could access.

```js
let count = 0;

function Counter() {
  const view = h("span", {}, count);
  const inc = () => {
    count = count + 1;
  };
  const button = h("button", { onclick: inc, disabled: count === 9 }, "+");
  return h("div", {}, view, button);
}
```

However this breaks our `inc` handler. Although the count is going up our component never updates. Previously we were directly changing the `textContent` of the element on the page. Now the only way for new changes to be reflected is to re-run the `Counter` function to get the newly updated DOM, then replace the contents of the `#app` div.

We can make this happen automatically by forcing all state updates to use a function that both updates the state _and_ re-renders the UI.

```js
let count = 0;

function setCount(newCount) {
  count = newCount; // update state variable
  app.innerHTML = ""; // get rid of old elements on page
  app.append(Counter()); // re-run Counter to get new elements
}

function Counter() {
  // ...
  const inc = () => setCount(count + 1);
  // ...
}
```

Every time we update the count value we empty `#app` div, then re-run the `Counter` function and put the new elements on the page.

### Challenge 3

1. Add another button to the counter containing a `-`
1. This button should lower the count by one each time it's clicked
1. It shouldn't let the user reduce the count below 0

<details>
<summary>Solution</summary>

```js
function Counter() {
  // ...
  const dec = () => setCount(count - 1);
  const decButton = h("button", { onclick: dec, disabled: count < 1 }, "-");
  // ...
  return h("div", {}, decButton, view, incButton);
}
```

</details>

### Performance sidenote

You may be thinking that this seems terribly inefficient. This is correct—we are wastefully throwing away every element on the page and recreating them from scratch every time the count changes, even if the element hasn't changed.

Modern browsers are very fast, so the performance hit is negligible unless you have a much more complex UI. Most frameworks (like React) compare the old and new UI so they only have to update the bits that have changed. That's a bit more complex than we can fit in this workshop though.

## Stretch goal: general purpose state

Currently we have a single state variable: `count`. This is fine for our simple app, but what if we had another value to keep track of? We would have to keep writing new `setBlah` functions that updated the page for every new stateful variable we needed.

Instead we can use an object as a single state variable, and store as many values as we like inside.

1. Change the `count` state variable to an object named `state`
1. Rename `setCount` to `setState`
1. `setState` should merge the old state with the new before updating the page
1. Replace all usage of `count` with `state.count`

**Hint**: [`Object.assign`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) may be useful.
