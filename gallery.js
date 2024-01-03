import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

document.addEventListener("DOMContentLoaded", () => {
  const minimap = document.querySelector(".minimap .preview");
  const fullSizeContainer = document.querySelector(".images");

  const getRandomLeft = () => {
    const values = [-15, -7.5, 0, 7.5, 15];
    return values[Math.floor(Math.random() * values.length)].toString() + "px";
  }
  
  minimap.innerHTML = "";
  fullSizeContainer.innerHTML = "";

  let activeThumbnail = null;
  
  const htmlId = document.querySelector(".doc-id").id;
  let length;
  switch (htmlId) {
    case "korea":
      length = 5;
      break
    case "food":
      length = 2;
      break
    case "wedding":
      length = 3;
      break
    case "selfies":
      length = 4;
      break
    case "misc":
      length = 3;
      break;
  }
  const backButton = document.getElementById("back-button"); 
  backButton.onclick = () => window.location.href = "/";
  
  for (let i = 1; i <= length; i++) {
    const randomLeft = getRandomLeft();
    let imagePath;
    switch (htmlId) {
      case "korea":
        imagePath = `/korea/korea-${i}.JPEG`;
        break
      case "food":
        imagePath = `/food/food-${i}.JPG`;
        break
      case "wedding":
        imagePath = `/wedding/wedding-${i}.JPG`;
        break
      case "selfies":
        imagePath = `/selfies/selfie-${i}.JPG`
        break
      case "misc":
        imagePath = `/misc/misc-${i}.JPG`
        break;
    }

    const thumbnailDiv = document.createElement("div");
    thumbnailDiv.className = "img-thumbnail";
    thumbnailDiv.style.left = randomLeft;
    const imgThumbnail = document.createElement("img");
    imgThumbnail.src = imagePath;
    thumbnailDiv.appendChild(imgThumbnail);
    minimap.appendChild(thumbnailDiv);
    
    const imgDiv = document.createElement("div");
    imgDiv.className = "img";
    const imgFull = document.createElement("img");
    imgFull.src = imagePath;
    imgDiv.appendChild(imgFull);
    fullSizeContainer.appendChild(imgDiv);

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: imgDiv,
      start: "top center",
      end: "bottom center",
      onToggle: self => {
        if (self.isActive) {
          if (activeThumbnail && activeThumbnail !== thumbnailDiv) {
            animateThumbnail(activeThumbnail, false);
          }

          animateThumbnail(thumbnailDiv, true);
          activeThumbnail = thumbnailDiv;
        } else if (activeThumbnail === thumbnailDiv) {
          animateThumbnail(thumbnailDiv, false);
        }
      }
    });

  }

  const animateThumbnail = (thumbnail, isActive) => {
    gsap.to(thumbnail, {
      border: isActive ? "1px solid #fff" : "none",
      opacity: isActive ? 1 : 0.5,
      scale: isActive ? 1.3 : 1,
      zIndex: isActive ? 10000 : 1,
      duration: 0.3
    });
  }
});

