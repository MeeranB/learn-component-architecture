import h from "./create-element.js";

let count = 0;

function setCount(newCount) {
  count = newCount; // update state variable
  app.innerHTML = ""; // get rid of old elements on page
  app.append(Counter()); // re-run Counter to get new elements
}

function Counter() {
  const view = h("span", {}, count);
  const dec = () => setCount(count - 1);
  const decButton = h("button", { onclick: dec, disabled: count < 1 }, "-");
  const inc = () => setCount(count + 1);
  const incButton = h("button", { onclick: inc, disabled: count === 9 }, "+");
  return h("div", {}, decButton, view, incButton);
}

const app = document.querySelector("#app");

// render for the initial view
// all subsequent re-renders happen in setCount
app.append(Counter());
