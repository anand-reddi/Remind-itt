import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { Capacitor } from "@capacitor/core";

// Track keyboard visibility state
let isKeyboardOpen = false;

// Initialize keyboard plugin for native platforms
export const initializeKeyboard = () => {
  if (Capacitor.isNativePlatform()) {
    // Set up keyboard event listeners
    Keyboard.addListener("keyboardWillShow", (info) => {
      // Adjust UI when keyboard is about to show
      document.body.classList.add("keyboard-is-open");
      isKeyboardOpen = true;

      // Add padding to the bottom of the page to prevent content from being hidden
      const scrollArea = document.querySelector(".scroll-area");
      if (scrollArea) {
        const paddingBottom = info.keyboardHeight + "px";
        scrollArea.setAttribute("style", `padding-bottom: ${paddingBottom}`);
      }
    });

    Keyboard.addListener("keyboardWillHide", () => {
      // Reset UI when keyboard is about to hide
      document.body.classList.remove("keyboard-is-open");
      isKeyboardOpen = false;

      // Remove the extra padding
      const scrollArea = document.querySelector(".scroll-area");
      if (scrollArea) {
        scrollArea.setAttribute("style", "padding-bottom: 0");
      }
    });

    // Configure keyboard settings
    try {
      // These might throw errors if the API doesn't match exactly
      Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {});
      Keyboard.setScroll({ isDisabled: false }).catch(() => {});

      // Use a type assertion for the resize mode
      Keyboard.setResizeMode({
        mode: "body" as unknown as KeyboardResize,
      }).catch(() => {});
    } catch (error) {
      console.error("Error configuring keyboard:", error);
    }
  } else {
    // For web browsers, use a resize event to detect virtual keyboards
    setupWebKeyboardDetection();
  }
};

// Setup keyboard detection for web browsers
const setupWebKeyboardDetection = () => {
  const initialWindowHeight = window.innerHeight;
  let lastWindowHeight = initialWindowHeight;

  const handleResize = () => {
    const currentWindowHeight = window.innerHeight;
    const heightDifference = Math.abs(
      initialWindowHeight - currentWindowHeight
    );

    // Consider keyboard open if height decreases by more than 15%
    if (
      currentWindowHeight < lastWindowHeight &&
      heightDifference > initialWindowHeight * 0.15
    ) {
      document.body.classList.add("keyboard-is-open");
      isKeyboardOpen = true;
    } else {
      document.body.classList.remove("keyboard-is-open");
      isKeyboardOpen = false;
    }

    lastWindowHeight = currentWindowHeight;
  };

  window.addEventListener("resize", handleResize);

  // Also detect focus on input elements
  document.addEventListener("focusin", (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLSelectElement
    ) {
      document.body.classList.add("keyboard-is-open");
      isKeyboardOpen = true;
    }
  });

  document.addEventListener("focusout", () => {
    // Short delay to prevent flickering
    setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        !(
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement instanceof HTMLSelectElement
        )
      ) {
        document.body.classList.remove("keyboard-is-open");
        isKeyboardOpen = false;
      }
    }, 100);
  });
};

// Helper to hide keyboard programmatically
export const hideKeyboard = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await Keyboard.hide();
    } catch (error) {
      console.error("Error hiding keyboard:", error);
    }
  } else {
    // For web, blur the active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }
};

// Helper to check if keyboard is visible
export const isKeyboardVisible = () => {
  return isKeyboardOpen;
};

// Add CSS to handle keyboard visibility
export const addKeyboardCSS = () => {
  // Add CSS to handle keyboard visibility
  const style = document.createElement("style");
  style.innerHTML = `
    body.keyboard-is-open .fixed.bottom-0 {
      display: none !important;
    }
    
    body.keyboard-is-open {
      height: calc(100% - var(--keyboard-height, 0px));
      overflow: hidden;
    }
    
    input, textarea, select {
      font-size: 16px !important; /* Prevents iOS zoom */
    }
  `;
  document.head.appendChild(style);
};
