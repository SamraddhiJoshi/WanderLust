(function () {
  "use strict";

  // =========================
  // BOOTSTRAP FORM VALIDATION
  // =========================

  const forms = document.querySelectorAll(".needs-validation");

  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });

  // =========================
  // TAX TOGGLE
  // =========================

  const taxSwitch = document.getElementById("flexSwitchCheckDefault");

  if (taxSwitch) {
    taxSwitch.addEventListener("change", function () {
      const priceElements = document.querySelectorAll(".listing-price");

      priceElements.forEach(function (priceElement) {
        // Get original price
        const basePrice = Number(priceElement.dataset.basePrice);

        if (isNaN(basePrice)) {
          return;
        }

        // Find tax information element
        const taxInfo = priceElement.parentElement.querySelector(".tax-info");

        // =========================
        // TAX INCLUDED
        // =========================

        if (taxSwitch.checked) {
          const taxRate = 0.18;

          const totalPrice = basePrice + basePrice * taxRate;

          priceElement.innerHTML = `&#8377; ${Math.round(totalPrice).toLocaleString("en-IN")} / night`;

          if (taxInfo) {
            taxInfo.style.display = "inline";
          }
        }

        // =========================
        // TAX NOT INCLUDED
        // =========================
        else {
          priceElement.innerHTML = `&#8377; ${basePrice.toLocaleString("en-IN")} / night`;

          if (taxInfo) {
            taxInfo.style.display = "none";
          }
        }
      });
    });
  }
})();
