/**
 * Triggers a mailto link, and if it fails to open a local email client
 * (detected by checking if browser window loses focus), it falls back
 * to opening the web Gmail compose page in a new tab.
 * 
 * @param {string} emailAddress - The target email address
 */
export const triggerMailWithFallback = (emailAddress) => {
  let focusLost = false;
  
  const handleBlur = () => {
    focusLost = true;
  };
  
  window.addEventListener("blur", handleBlur);
  
  // Trigger mailto protocol
  const mailtoUrl = `mailto:${emailAddress}`;
  const tempLink = document.createElement("a");
  tempLink.href = mailtoUrl;
  tempLink.style.display = "none";
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);

  // Check if browser lost focus after 1 second
  setTimeout(() => {
    window.removeEventListener("blur", handleBlur);
    if (!focusLost) {
      // Fallback: Open web Gmail compose window (stable official URL to prevent routing freeze)
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailAddress)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }, 1000);
};
