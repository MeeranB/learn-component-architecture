import h from "./create-element.js";

let state = {
  count: 0,
};

function setState(newState) {
  Object.assign(state, newState); // merge new state values in
  app.innerHTML = ""; // get rid of old elements on page
  app.append(Counter()); // re-run Counter to get new elements
}

function Counter() {
  const count = state.count;
  const view = h("span", {}, count);
  const dec = () => setState({ count: count - 1 });
  const decButton = h("button", { onclick: dec, disabled: count < 1 }, "-");
  const inc = () => setState({ count: count + 1 });
  const incButton = h("button", { onclick: inc, disabled: count === 9 }, "+");
  return h("div", {}, decButton, view, incButton);
}

const app = document.querySelector("#app");

// render for the initial view
// all subsequent re-renders happen in setState
app.append(Counter());
