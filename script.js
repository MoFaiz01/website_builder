document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const sidebar = document.querySelector(".sidebar");
  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;

  let dark = false;
  let blockId = 1;
  let history = [];
  let historyIndex = -1;

  // Theme loading
  function setTheme(isDark) {
    dark = isDark;
    body.classList.toggle("dark-theme", dark);
    themeBtn.textContent = dark ? "☀️" : "🌙";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }
  setTheme(localStorage.getItem("theme") === "dark");
  themeBtn.addEventListener("click", () => setTheme(!dark));

  // Drag-and-Drop Sidebar
  sidebar.addEventListener("dragstart", e => {
    if (e.target.classList.contains("component")) {
      e.dataTransfer.setData("type", e.target.dataset.type);
    }
  });

  canvas.addEventListener("dragover", e => e.preventDefault());

  canvas.addEventListener("drop", e => {
    e.preventDefault();
    const type = e.dataTransfer.getData("type");
    const element = createElement(type);
    if (element) {
      removeHint();
      canvas.appendChild(element);
      saveState();
    }
  });

  // Canvas REORDER support
  canvas.addEventListener("dragstart", e => {
    if (e.target.classList.contains("canvas-item")) {
      e.dataTransfer.setData("drag-id", e.target.id);
    }
  });

  canvas.addEventListener("drop", e => {
    const dragId = e.dataTransfer.getData("drag-id");
    const dragged = document.getElementById(dragId);
    const target = e.target.closest(".canvas-item");
    if (dragged && target && dragged !== target) {
      canvas.insertBefore(dragged, target);
      saveState();
    }
  });

  function createElement(type) {
    const wrapper = document.createElement("div");
    wrapper.className = "block canvas-item";
    wrapper.setAttribute("draggable", "true");
    wrapper.id = `block-${blockId++}`;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      wrapper.remove();
      saveState();
      if (!canvas.querySelector(".canvas-item")) canvas.innerHTML = `<p class="hint">Drag components here...</p>`;
    };

    let content;
    switch (type) {
      case "text":
        content = document.createElement("div");
        content.className = "editable";
        content.contentEditable = true;
        content.textContent = "Edit this text...";
        break;
      case "heading":
        content = document.createElement("h2");
        content.className = "editable";
        content.contentEditable = true;
        content.textContent = "Edit heading...";
        break;
      case "paragraph":
        content = document.createElement("p");
        content.className = "editable";
        content.contentEditable = true;
        content.textContent = "Edit paragraph...";
        break;
      case "button":
        content = document.createElement("button");
        content.textContent = "Click Me";
        break;
      case "image":
        content = document.createElement("div");
        content.innerHTML = `
          <img src="https://placekitten.com/400/200" alt="Sample Image" style="max-width:100%; border-radius:10px; margin-bottom:6px;">
          <input type="file" style="display:none;">
          <button class="upload-btn">Upload Image</button>
        `;
        const img = content.querySelector("img");
        const fileInput = content.querySelector("input");
        const uploadBtn = content.querySelector(".upload-btn");
        uploadBtn.onclick = () => fileInput.click();
        fileInput.onchange = e => {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = evt => (img.src = evt.target.result);
          reader.readAsDataURL(file);
        };
        break;
      case "divider":
        content = document.createElement("hr");
        break;
      case "list":
        content = document.createElement("ul");
        content.className = "editable";
        content.contentEditable = true;
        content.innerHTML = "<li>Item 1</li><li>Item 2</li>";
        break;
      case "card":
        content = document.createElement("div");
        content.innerHTML = `
          <h3 contenteditable="true">Card Title</h3>
          <p contenteditable="true">Card content goes here...</p>
        `;
        break;
      default:
        content = document.createElement("div");
        content.textContent = `Unknown block: ${type}`;
    }
    wrapper.appendChild(delBtn);
    wrapper.appendChild(content);
    return wrapper;
  }

  function removeHint() {
    const hint = canvas.querySelector(".hint");
    if (hint) hint.remove();
  }

  window.clearCanvas = function () {
    canvas.innerHTML = '<p class="hint">Drag components here...</p>';
    saveState();
  };

  window.exportHTML = function () {
    const content = canvas.innerHTML;
    const html = `
<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Export</title>
<style>body { font-family: sans-serif; padding: 30px; }</style>
</head><body>
${content}
</body></html>
    `;
    const blob = new Blob([html], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "exported_layout.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window.previewCanvas = function () {
    const win = window.open("", "_blank");
    win.document.write(`
<!DOCTYPE html><html><head><title>Preview</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>
${canvas.innerHTML}
</body></html>
    `);
    win.document.close();
  };

  function saveState() {
    history = history.slice(0, historyIndex + 1);
    history.push(canvas.innerHTML);
    historyIndex++;
  }

  window.undo = function () {
    if (historyIndex > 0) {
      historyIndex--;
      canvas.innerHTML = history[historyIndex];
      rebindDeleteButtons();
    }
  };

  window.redo = function () {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      canvas.innerHTML = history[historyIndex];
      rebindDeleteButtons();
    }
  };

  function rebindDeleteButtons() {
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => {
        btn.parentElement.remove();
        if (!canvas.querySelector(".canvas-item")) {
          canvas.innerHTML = `<p class="hint">Drag components here...</p>`;
        }
        saveState();
      };
    });
  }

  saveState(); // Save initial state
});
