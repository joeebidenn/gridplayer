const SUPPORTED_EXTENSIONS = {
    video: ['mp4', 'webm', 'ogg', 'avi', 'wmv', 'mpg', 'mov', 'mkv', 'MOV', 'MP4'],
    image: ['jpg', 'jpeg', 'png', 'gif', 'heic', 'webp'],
    pdf: ['pdf']
};
var SWIPE_STARTER;
var SWIPE_RECEIVER;
const dropzone = document.getElementById("dropzone");
const boxmediacontainer = document.getElementById("boxmediacontainer");

window.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.display = "block";
});

window.addEventListener("dragleave", (e) => {
    if (e.relatedTarget === null) dropzone.style.display = "none";
});

window.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.display = "none";
    handleFiles(e.dataTransfer.files);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "i") {
      const nuevoTexto = prompt("Image extensions:", SUPPORTED_EXTENSIONS.image.join(", "));
      if (nuevoTexto !== null) {
        SUPPORTED_EXTENSIONS.image =  nuevoTexto.split(",").map(e => e.trim()).filter(e => e);
      }
    } else if(event.key === "v") {
        const nuevoTexto = prompt("Video extensions:", SUPPORTED_EXTENSIONS.video.join(", "));
        if (nuevoTexto !== null) {
          SUPPORTED_EXTENSIONS.video =  nuevoTexto.split(",").map(e => e.trim()).filter(e => e);
        }
    }
});

function handleFiles(files) {
    Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        console.log("archivo cargado ext: "+ext)
        if (SUPPORTED_EXTENSIONS.video.includes(ext)) {
            const mediaSrc = URL.createObjectURL(file);
            addMediaBox(mediaSrc, 'video');
        }
        if(SUPPORTED_EXTENSIONS.image.includes(ext)){
            const mediaSrc = URL.createObjectURL(file);
            addMediaBox(mediaSrc, 'image');
        }
        if(SUPPORTED_EXTENSIONS.pdf.includes(ext)){
            const mediaSrc = URL.createObjectURL(file);
            addMediaBox(mediaSrc, 'pdf');
        }


    });
}

function addMediaBox(src, type){
    const mediabox = document.createElement("div");
    mediabox.className = "mediabox";
    if(type==='pdf'){
        const media = document.createElement("iframe");
        media.src = src;
        media.style.width = "100%";
        media.style.height = "100%";
        media.style.border = "none";
        mediabox.appendChild(media);
    }else{
        const media = document.createElement(type.startsWith("image") ? "img" : "video");
        media.src = src;
        media.style.height = "100%";
        media.style.transform = "scale(1) translate(0px, 0px)";
        if (type.startsWith("video")) {
            media.controls = true;
            media.autoplay = true;
            media.muted = true;
            media.loop = true;
        }
        mediabox.appendChild(media);
    }


    addTools(mediabox);
    //addLeftControls(mediabox);
    //addRightControls(mediabox);
    addMediaBoxExchangeComponent(mediabox)
    boxmediacontainer.appendChild(mediabox);
}

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const moveStep = (e, dx, dy) => {
  const bmedia = e.target.parentElement.parentElement.querySelector("img, video");
  const container = bmedia.parentElement;

  const match = bmedia.style.transform.match(/scale\((.*?)\)\s*translate\((.*?)px,\s*(.*?)px\)/);
  let [scale, x, y] = match ? match.slice(1).map(parseFloat) : [1, 0, 0];

  const scaledW = bmedia.offsetWidth * scale;
  const scaledH = bmedia.offsetHeight * scale;
  const maxX = Math.max(0, (scaledW - container.clientWidth) / (2 * scale));
  const maxY = Math.max(0, (scaledH - container.clientHeight) / (2 * scale));

  if (dx === 'max') x = maxX;
  else if (dx === '-max') x = -maxX;
  else x += dx;

  if (dy === 'max') y = maxY;
  else if (dy === '-max') y = -maxY;
  else y += dy;

  x = clamp(x, -maxX, maxX);
  y = clamp(y, -maxY, maxY);

  bmedia.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
};

const zoom = (bmedia,isZoomIn) => {
    if(isZoomIn){
        let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
        bmedia.style.transform = `scale(${scale + 0.1}) translate(0px, 0px)`;

    }else{
        let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
        bmedia.style.transform = `scale(${Math.max(scale - 0.1, 1)}) translate(0px, 0px)`;
    }
}
function addTools(mediabox){

    //CLOSE CONTROL
    const closeContainer = document.createElement("div");
    closeContainer.className = "controls close-container";

    const closeButton = document.createElement("button");
    closeButton.textContent = "✖";
    closeButton.onclick = (e) => {
        //parent(button).parent(div).remover()
         e.target.parentElement.parentElement.remove();
    };
    closeContainer.append(closeButton);

    //ZOOM CONTROL

    const zoomContanier = document.createElement("div");
    zoomContanier.className = "controls zoom-container";

    const zoomInButton = document.createElement("button");
    zoomInButton.textContent = "+"
    zoomInButton.onclick = (e) => {
        const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
        zoom(bmedia,true)
    };

    const zoomOutButton = document.createElement("button");
    zoomOutButton.textContent = "-"
    zoomOutButton.onclick = (e) => {
        const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
        zoom(bmedia,false)
    };

    const zoomResetButton = document.createElement("button");
    zoomResetButton.textContent = "[[]]"
    zoomResetButton.onclick = (e) => {
        const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
        bmedia.style.transform = `scale(1) translate(0px, 0px)`;
    };


    zoomContanier.append(
        zoomInButton,
        zoomOutButton,
        zoomResetButton
    )

    mediabox.addEventListener("wheel", (e) => {
        e.preventDefault();
        if(e.deltaX===0){
            if(e.deltaY>0){
                const bmedia=e.currentTarget.querySelector("img, video")
                zoom(bmedia,false)

            }else{
                const bmedia=e.currentTarget.querySelector("img, video")
                zoom(bmedia,true)
            }
        }
    });

    //SIZE CONTROL

    const sizeContanier = document.createElement("div");
    sizeContanier.className = "controls size-container";

    const expand1Btn = document.createElement("button");
    expand1Btn.textContent = "1x";
    expand1Btn.onclick = (e) => expandIt(e,1)

    const expand2Btn = document.createElement("button");
    expand2Btn.textContent = "2x";
    expand2Btn.onclick = (e) => expandIt(e,2)

    const expand3Btn = document.createElement("button");
    expand3Btn.textContent = "3x";
    expand3Btn.onclick = (e) => expandIt(e,3)

    sizeContanier.append(
        expand1Btn,
        expand2Btn,
        expand3Btn
    )


    //PAN CONTROLS
    const topToolContainer = document.createElement("div");
    topToolContainer.className = "controls top-container";
    const topStep = document.createElement("button");
    topStep.textContent = "⬆"
    topStep.onclick = (e) => moveStep(e, 0, 10);

    const topComplete = document.createElement("button");
    topComplete.textContent = "⬆⬆"
    topComplete.onclick = (e) => moveStep(e, 0, 'max');

    topToolContainer.append(
        topComplete,
        topStep
    )

    const bottomToolContainer = document.createElement("div");
    bottomToolContainer.className = "controls bottom-container";
    const bottomStep = document.createElement("button");
    bottomStep.textContent = "⬇"
    bottomStep.onclick = (e) => moveStep(e, 0, -10);

    const bottomComplete = document.createElement("button");
    bottomComplete.textContent = "⬇⬇"
    bottomComplete.onclick = (e) => moveStep(e, 0, '-max');

    bottomToolContainer.append(
        bottomStep,
        bottomComplete
    )

    const rightToolContainer = document.createElement("div");
    rightToolContainer.className = "controls right-container";
    const rightStep = document.createElement("button");
    rightStep.textContent = "➡"
    rightStep.onclick = (e) => moveStep(e, -10, 0);

    const rightComplete = document.createElement("button");
    rightComplete.textContent = "➡\n➡"
    rightComplete.style.whiteSpace = "pre-line";
    rightComplete.onclick = (e) => moveStep(e, '-max', 0);

    rightToolContainer.append(
        rightStep,
        rightComplete
    )


    const leftToolContainer = document.createElement("div");
    leftToolContainer.className = "controls left-container";
    const leftStep = document.createElement("button");
    leftStep.textContent = "⬅"
    leftStep.onclick = (e) => moveStep(e, 10, 0);

    const leftComplete = document.createElement("button");
    leftComplete.textContent = "⬅\n⬅"
    leftComplete.style.whiteSpace = "pre-line";
    leftComplete.onclick = (e) => moveStep(e, 'max', 0);

    leftToolContainer.append(
        leftComplete,
        leftStep
    )



    mediabox.append(
        closeContainer,
        zoomContanier,
        sizeContanier,
        topToolContainer,
        bottomToolContainer,
        rightToolContainer,
        leftToolContainer
    )
}

const move = (e, dx, dy) => {
    const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
    let [scale, translateX, translateY] = bmedia.style.transform.match(/scale\((.*?)\) translate\((.*?)px, (.*?)px\)/)?.slice(1).map(parseFloat) || [1, 0, 0];
    bmedia.style.transform = `scale(${scale}) translate(${translateX + dx}px, ${translateY + dy}px)`;
};

const expandIt= (e, size)=>{
    const bmedia=e.target.parentElement.parentElement
    bmedia.style.flex=size
}


function addLeftControls(mediabox){
    const zoomControls = document.createElement("div");
    zoomControls.className = "controls zoom-controls";


    mediabox.addEventListener("wheel", (e) => {
        e.preventDefault();
        if(e.deltaX===0){
            if(e.deltaY>0){
                const bmedia=e.currentTarget.querySelector("img, video")
                let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
                bmedia.style.transform = `scale(${Math.max(scale - 0.1, 1)}) translate(0px, 0px)`;

            }else{
                const bmedia=e.currentTarget.querySelector("img, video")
                let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
                bmedia.style.transform = `scale(${scale + 0.1}) translate(0px, 0px)`;
            }
        }
    });

    const zoomInBtn = document.createElement("button");
    zoomInBtn.textContent = "+";
    zoomInBtn.onclick = (e) => {
        const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
        let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
        bmedia.style.transform = `scale(${scale + 0.1}) translate(0px, 0px)`;
    };

    const zoomOutBtn = document.createElement("button");
    zoomOutBtn.textContent = "-";
    zoomOutBtn.onclick = (e) => {
        const bmedia=e.target.parentElement.parentElement.querySelector("img, video")
        let scale = parseFloat(bmedia.style.transform.match(/scale\((.*?)\)/)?.[1]) || 1;
        bmedia.style.transform = `scale(${Math.max(scale - 0.1, 1)}) translate(0px, 0px)`;
    };

    const leftArrowBtn = document.createElement("button");
    leftArrowBtn.textContent = "⬅";
    leftArrowBtn.onclick = (e) => move(e, -10, 0);

    const rightArrowBtn = document.createElement("button");
    rightArrowBtn.textContent = "➡";
    rightArrowBtn.onclick = (e) => move(e, 10, 0);

    const upArrowBtn = document.createElement("button");
    upArrowBtn.textContent = "⬆";
    upArrowBtn.onclick = (e) => move(e, 0, -10);

    const downArrowBtn = document.createElement("button");
    downArrowBtn.textContent = "⬇";
    downArrowBtn.onclick = (e) => move(e, 0, 10);

    const expand1Btn = document.createElement("button");
    expand1Btn.textContent = "1x";
    expand1Btn.onclick = (e) => expandIt(e,1)

    const expand2Btn = document.createElement("button");
    expand2Btn.textContent = "2x";
    expand2Btn.onclick = (e) => expandIt(e,2)

    const expand3Btn = document.createElement("button");
    expand3Btn.textContent = "3x";
    expand3Btn.onclick = (e) => expandIt(e,3)

    zoomControls.append(
        zoomInBtn,
        zoomOutBtn,
        upArrowBtn,
        downArrowBtn,
        leftArrowBtn,
        rightArrowBtn,
        expand1Btn,
        expand2Btn,
        expand3Btn
    )

    mediabox.append(zoomControls)
}

function addRightControls(mediabox){
    const closeControl = document.createElement("div");
    closeControl.className = "controls close-control";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✖";
    closeBtn.onclick = (e) => {
        //parent(button).parent(div).remover()
         e.target.parentElement.parentElement.remove();
    };
    closeControl.appendChild(closeBtn);
    mediabox.append(closeControl)
}

function addMediaBoxExchangeComponent(mediabox){

    //adds swipe stater, init the swipe event
    const swipestarter = document.createElement("div");
    swipestarter.className = "swipestarter";
    swipestarter.draggable = true;
    swipestarter.ondragstart = (e) => {
        SWIPE_STARTER = e.target.parentElement;
        e.dataTransfer.effectAllowed = 'move';

        boxmediacontainer.querySelectorAll(".mediabox").forEach(b => {
            if (b !== e.target.parentElement) {
                b.classList.add("dragging");
                b.querySelector(".swipereceiver").style.display = "block";
            }
        });
    };
    swipestarter.ondragend = () => {
        boxmediacontainer.querySelectorAll(".mediabox").forEach(b => {
            b.classList.remove("dragging");
            b.querySelector(".swipereceiver").style.display = "none";
        });
        SWIPE_STARTER = null;
    };
    //adds swipe receiver, receives the swipe event

    const swipereceiver = document.createElement("div");
    swipereceiver.className = "swipereceiver";
    swipereceiver.ondragover = (e) => e.preventDefault();
    swipereceiver.ondrop = (e) => {
        e.preventDefault();
        SWIPE_RECEIVER = e.target.parentElement;
        if (SWIPE_STARTER && SWIPE_RECEIVER && SWIPE_STARTER !== SWIPE_RECEIVER) {

            const draggedMedia = SWIPE_STARTER.querySelector("img, video");
            const targetMedia = SWIPE_RECEIVER.querySelector("img, video");

            if (draggedMedia && targetMedia) {
                const clonedDraggedMedia = draggedMedia.cloneNode(true);
                const clonedTargetMedia = targetMedia.cloneNode(true);

                targetMedia.parentNode.replaceChild(clonedDraggedMedia, targetMedia);
                if (clonedDraggedMedia.tagName === "VIDEO") {
                    clonedDraggedMedia.muted = true;
                    clonedDraggedMedia.autoplay = true;
                    clonedDraggedMedia.loop = true;
                }
                draggedMedia.parentNode.replaceChild(clonedTargetMedia, draggedMedia);
                if (clonedTargetMedia.tagName === "VIDEO") {
                    clonedTargetMedia.muted = true;
                    clonedTargetMedia.autoplay = true;
                    clonedTargetMedia.loop = true;
                }
            }
        }
    };

    mediabox.append(swipestarter, swipereceiver);


}