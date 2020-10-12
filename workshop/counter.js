import h from "./create-element.js"

let count = 0

function setCount(newCount) {
  count = newCount
  app.innerHTML = ``
  app.append(counter());
}

function counter() {
  const view = h("span", {}, count)
  const inc = () => {
    setCount(count + 1)
  }
  const dec = () => {
    setCount(count - 1)
  }
  const minusButton = h("button", { onclick: dec, disabled: count < 1}, "-")
  const button = h("button", { onclick: inc, disabled: count === 9 }, "+")
  return h("div", {}, minusButton, view, button)
}

// put the elements onto the page
const app = document.querySelector("#app");
app.append(counter());