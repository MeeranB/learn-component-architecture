const view = document.createElement("span");
view.append("0");

const button = document.createElement("button");
button.append("+");
button.onclick = () => {
  view.textContent = parseInt(view.textContent) + 1;
};

const counter = document.createElement("div");
counter.append(view, button);

// put the elements onto the page
const app = document.querySelector("#app");
app.append(counter);
