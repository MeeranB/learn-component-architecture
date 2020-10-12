import h from "./create-element.js"


function counter() {
  const view = h("span", {}, "0")
  const button = h("button", { onclick: () => {
    view.textContent = parseInt(view.textContent) + 1;
  }}, "+")
  return h("div", {}, view, button)
}

// put the elements onto the page
const app = document.querySelector("#app");
app.append(counter());