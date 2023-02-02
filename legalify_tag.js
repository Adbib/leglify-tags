/* eslint-disable no-unused-expressions */
!(function () {
  const t = {
    config: {
      dataAttrAppUrl: "data-checkify-url",
      dataAttrName: "data-checkify",
      defaultAppBaseUrl: "http://localhost:3000/",
      domainPath: "/api/public/checkoutDomain",
    },
    variables: { isPreventDefaultHandlers: !0, isCheckoutProcessing: !1 },
    cartApi: {
      clearCart: function () {
        return fetch("/cart/clear.js", {
          method: "POST",
          credentials: "same-origin",
        });
      },
      addToCart: function (t) {
        return fetch("/cart/add.js", {
          method: "POST",
          credentials: "same-origin",
          body: "FORM" === t.nodeName ? new FormData(t) : t,
        });
      },
    },
    helpers: {
      debounce: function (t, e) {
        let o = !1;
        return function () {
          o ||
            ((o = !0),
            setTimeout(() => {
              t.apply(this, arguments), (o = !1);
            }, e));
        };
      },
      isDescendant: (t, e) => {
        let o = e.parentNode;
        for (; null != o; ) {
          if (o == t) return !0;
          o = o.parentNode;
        }
        return !1;
      },
      addCaptureListener: (e, o, n) => {
        e.addEventListener &&
          window.addEventListener(
            o,
            (o) => {
              (o.target === e || t.helpers.isDescendant(e, o.target)) &&
                (o.stopImmediatePropagation(), o.preventDefault(), n());
            },
            !0
          );
      },
      getCookie: (t) => {
        let e = document.cookie.match(
          new RegExp(
            "(?:^|; )" +
              t.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
              "=([^;]*)"
          )
        );
        return e ? decodeURIComponent(e[1]) : void 0;
      },
      setCookie: (t, e) => {
        let o = new Date(Date.now() + 18e5).toUTCString();
        document.cookie = `${t}=${e}; expires=` + o + ";path=/;";
      },
    },
    dom: {
      selectors: {
        checkoutForm:
          'form[action^="/cart"]:not([action^="/cart/"]), form[action="/checkout"], form[action="/a/checkout"]',
        checkoutButton:
          '[name="checkout"],[name="Checkout"],[class*="opcCheckout"],[class*="checkout-btn"],[class*="btn-checkout"],[class*="checkout-button"],[class*="button-checkout"],[class*="carthook_checkout"],[type*="submit"][class*="action_button"]:not([name*="add"]),[href*="/checkout"][class*="action_button"],[id*="checkout"],[id*="Checkout"],[id*="checkout-button"],[id*="checkout-btn"]',
        directCheckoutLink: 'a[href^="/checkout"],[onclick*="/checkout"]',
        addToCartForm: 'form[action^="/cart/add"]',
        returnToField: 'input[name="return_to"][value*="checkout"]',
        buyNowForm: 'form[action^="/cart/add"][data-skip-cart="true"]',
        checkoutUpdateButton: '[type="submit"][name="update"]',
        dynamicPaymentButton:
          '[data-shopify="payment-button"] button,[data-shopify="payment-button"] .shopify-payment-button__button',
        dynamicPaymentButtonContainer: '[data-shopify="payment-button"]',
      },
      getCheckoutForms: () =>
        document.querySelectorAll(t.dom.selectors.checkoutForm),
      getCheckoutButtons: () =>
        document.querySelectorAll(t.dom.selectors.checkoutButton),
      getCheckoutLinks: () =>
        document.querySelectorAll(t.dom.selectors.directCheckoutLink),
      getBuyItNowForms: () => {
        const e = [...document.querySelectorAll(t.dom.selectors.buyNowForm)];
        return (
          document
            .querySelectorAll(t.dom.selectors.returnToField)
            .forEach((t) => {
              const o = t.closest("form");
              o && e.filter((t) => o.isSameNode(t)).length <= 0 && e.push(o);
            }),
          e
        );
      },
      getAddToCardForm: () =>
        document.querySelector(t.dom.selectors.addToCartForm),
      getDynamicPaymentButtons: () =>
        document.querySelectorAll(t.dom.selectors.dynamicPaymentButton),
      getUpdateCartButtons: () =>
        document.querySelectorAll(t.dom.selectors.checkoutUpdateButton),
      getDynamicPaymentButtonContainer: () =>
        document.querySelector(t.dom.selectors.dynamicPaymentButtonContainer),
    },
    functions: {
      getAppBaseUrl: () => {
        const e = document.querySelector("[" + t.config.dataAttrAppUrl + "]");
        return e
          ? e.getAttribute(t.config.dataAttrAppUrl)
          : t.config.defaultAppBaseUrl;
      },
      getOriginUrl: () => window.location.origin,
      getCartToken: () => t.helpers.getCookie("cart"),
      getStoreName: () =>
        window.Shopify && window.Shopify.shop ? window.Shopify.shop : "",
      submitBuyNowForm: (e) => {
        let o = e.closest("form");
        if ((o || (o = t.dom.getAddToCardForm()), o)) {
          if (!o.querySelector('[name="quantity"]')) {
            const t = document.createElement("input");
            t.setAttribute("type", "hidden"),
              t.setAttribute("name", "quantity"),
              t.setAttribute("value", "1"),
              o.appendChild(t);
          }
          if (!o.querySelector('input[name="return_to"]')) {
            const t = document.createElement("input");
            t.setAttribute("type", "hidden"),
              t.setAttribute("name", "return_to"),
              t.setAttribute("value", "/checkout"),
              o.appendChild(t);
          }
          t.cartApi
            .clearCart()
            .then(() => t.cartApi.addToCart(o))
            .then(() => t.functions.processCheckout());
        }
      },
      processCheckout: () => {
        if (!1 === t.variables.isCheckoutProcessing) {
          t.variables.isCheckoutProcessing = !0;
          const e = t.variables.checkoutDomain || t.functions.getAppBaseUrl(),
            o = t.functions.getCartToken(),
            n = t.functions.getStoreName(),
            a = encodeURI(t.functions.getOriginUrl()),
            c = t.helpers.getCookie("_shopify_sa_p");
          let r = new URLSearchParams(window.location.search),
            i = r.get("utm_campaign"),
            s = r.get("utm_medium"),
            u = r.get("utm_source"),
            d = r.get("utm_content"),
            l = r.get("utm_term");
          const m = `${i ? `&${i}` : ""}${s ? `&${s}` : ""}${u ? `&${u}` : ""}${
              d ? `&${d}` : ""
            }${l ? `&${l}` : ""}`,
            h = t.helpers.getCookie("_fbp"),
            p =
              (
                window.navigator.languages &&
                window.navigator.languages.length &&
                window.navigator.languages[0]
              ).substring(0, 2) ||
              window.navigator.language.substring(0, 2) ||
              "en",
            g = t.variables.language;
          if (e && o && n) {
            let t = !1;
            const r =
              e +
              //   "/static/html/checkout-redirect.html?storeName=" +
              "cart?storeName=" +
              n +
              "&cartToken=" +
              o +
              "&originUrl=" +
              a;
            // window.ga
            //   ? (ga(function (e) {
            //       var o = e.get("linkerParam");
            //       (window.location = `${r}&${o}${
            //         c ? `&${c}` : m ? `${m}` : ""
            //       }${h ? `&_fbp=${h}` : ""}${p ? `&utm_lang=${p}` : ""}${
            //         g ? `&utm_iplang=${g}` : ""
            //       }`),
            //         (t = !0);
            //     }),
            //     t ||
            //       (window.location = `${r}${c ? `&${c}` : m ? `${m}` : ""}${
            //         h ? `&_fbp=${h}` : ""
            //       }${p ? `&utm_lang=${p}` : ""}${g ? `&utm_iplang=${g}` : ""}`))
            //     :
            const checkC = c ? `&${c}` : m ? `${m}` : "";
            const checkH = h ? `&_fbp=${h}` : "";
            const checkP = p ? `&utm_lang=${p}` : "";
            const checkG = g ? `&utm_iplang=${g}` : "";
            console.log("vla", `${r}${checkC}${checkH}${checkP}${checkG}`);
            return (window.location = `${r}${checkC}${checkH}${checkP}${checkG}`);
          } else window.location = "/checkout";
        }
      },
      killCompetitors: () => {
        try {
          window.CHKX && CHKX.main && CHKX.main.unmount
            ? CHKX.main.unmount()
            : (window.CHKX = {}),
            (window.TLCK = {});
        } catch (t) {
          console.error(t);
        }
      },
      addHandlers: () => {
        const e = t.dom.getCheckoutForms(),
          o = t.dom.getCheckoutLinks(),
          n = t.dom.getCheckoutButtons(),
          a = t.dom.getBuyItNowForms(),
          c = t.dom.getUpdateCartButtons();
        [...e].forEach((e) => {
          "true" !== e.getAttribute(t.config.dataAttrName) &&
            (t.helpers.addCaptureListener(e, "submit", () => {
              t.functions.processCheckout();
            }),
            e.setAttribute(t.config.dataAttrName, "true"));
        }),
          [...o, ...n].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "mousedown", () => {
                t.functions.processCheckout();
              }),
              t.helpers.addCaptureListener(e, "touchstart", () => {
                t.functions.processCheckout();
              }),
              t.helpers.addCaptureListener(e, "click", () => {
                t.functions.processCheckout();
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          }),
          [...a].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "submit", () => {
                t.functions.submitBuyNowForm(e);
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          }),
          [...c].forEach((e) => {
            "true" !== e.getAttribute(t.config.dataAttrName) &&
              (t.helpers.addCaptureListener(e, "click", () => {
                e.closest("form").submit();
              }),
              e.setAttribute(t.config.dataAttrName, "true"));
          });
      },
      addDynamicButtonHandlers: () => {
        [...t.dom.getDynamicPaymentButtons()].forEach((e) => {
          t.helpers.addCaptureListener(e, "click", () => {
            t.functions.submitBuyNowForm(e);
          });
        });
      },
      loadCheckoutDomain: async () => {
        const e =
          sessionStorage.getItem("checkoutDomain") ||
          t.helpers.getCookie("checkoutDomain");
        if (e) t.variables.checkoutDomain = e;
        else
          try {
            const e = `${t.config.defaultAppBaseUrl}${t.config.domainPath}`,
              o = t.functions.getStoreName(),
              n = new URLSearchParams({ storeName: o }),
              a = await fetch(`${e}?${n}`),
              c = { domain: "http://localhost:3000/" }, // await a.json();
              cc = await a.json();
              console.log("reqoo", cc)
            if (c.domain) {
              t.variables.checkoutDomain = c.domain;
              try {
                sessionStorage.setItem("checkoutDomain", c.domain);
              } catch (t) {
                console.error(t);
              }
              try {
                t.helpers.setCookie("checkoutDomain", c.domain);
              } catch (t) {
                console.error(t);
              }
            }
          } catch (t) {
            console.error(t);
          }
      },
      loadLang: async () => {
        const e = await fetch("https://get.geojs.io/v1/ip/country.json"),
          { country: o } = await e.json(),
          n = await fetch(`https://restcountries.com/v2/alpha/${o}`, {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }),
          a = await n.json();
        try {
          a.languages[0].iso639_1 &&
            (t.variables.language = a.languages[0].iso639_1);
        } catch (e) {
          t.variables.language = "en";
        }
      },
      initFB: () => {
        function t(t) {
          let e = t.exec(window.document.cookie);
          return e && e[1] ? e[1] : "";
        }
        t(/_fbp=(fb\.1\.\d+\.\d+)/), t(/_fbс=(fb\.1\.\d+\.\d+)/);
      },
      init: () => {
        t.functions.killCompetitors(),
          t.functions.addDynamicButtonHandlers(),
          t.functions.addHandlers(),
          document.addEventListener("DOMContentLoaded", () => {
            t.functions.killCompetitors(),
              t.functions.addDynamicButtonHandlers(),
              t.functions.addHandlers();
          }),
          window.addEventListener("load", () => {
            t.functions.killCompetitors(),
              t.functions.addDynamicButtonHandlers(),
              t.functions.addHandlers();
            const e = t.helpers.debounce(() => {
              t.functions.addHandlers(), t.functions.addDynamicButtonHandlers();
            }, 1e3);
            new MutationObserver(() => {
              e();
            }).observe(window.document, {
              attributes: !0,
              childList: !0,
              subtree: !0,
            });
          });
      },
    },
  };
  // eslint-disable-next-line no-unused-expressions
  t.functions.initFB(),
    t.functions.init(),
    t.functions.loadCheckoutDomain(),
    t.functions.loadLang();
})();
