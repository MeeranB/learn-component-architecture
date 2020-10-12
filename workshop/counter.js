import h from "./create-element.js"

let state = {count: 0}

function setState(newState) {
  Object.assign(state, newState)
  app.innerHTML = ``
  app.append(counter());
}

function counter() {
  const count = state.count
  const view = h("span", {}, count)
  const inc = () => {
    setState({count: count + 1})
  }
  const dec = () => {
    setState({count: count - 1})
  }
  const minusButton = h("button", { onclick: dec, disabled: count < 1}, "-")
  const button = h("button", { onclick: inc, disabled: count === 9 }, "+")
  return h("div", {}, minusButton, view, button)
}

// put the elements onto the page
const app = document.querySelector("#app");
app.append(counter());