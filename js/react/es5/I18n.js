"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return !!right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var I18n = function () {
  function I18n(defaultLocale, supportedLocales) {
    var fileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_';
    var fileDir = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'i18n';

    _classCallCheck(this, I18n);

    if (typeof defaultLocale !== 'string') {
      throw new Error('Error - I18n - Missing default locale See examples for usage.');
    } else if (!Array.isArray(supportedLocales)) {
      throw new Error('Error - I18n - Missing or invalid supported locales. See examples for usage.');
    }

    this.state = {
      fileName: fileName,
      fileDir: fileDir,
      defaultLocale: defaultLocale,
      supportedLocales: supportedLocales,
      currentLocale: null,
      langText: {},
      langCache: {},
      startCallback: null,
      loadedCallback: null
    };
    window.addEventListener('hashchange', this.onHashChange.bind(this));
    this.onHashChange();
  }

  _createClass(I18n, [{
    key: "onLangStart",
    value: function onLangStart(callback) {
      this.state.startCallback = callback;
    }
  }, {
    key: "onLangLoaded",
    value: function onLangLoaded(callback) {
      this.state.loadedCallback = callback;
    }
  }, {
    key: "onHashChange",
    value: function onHashChange() {
      var i18n = this;
      var state = this.state;
      var currentLocale = null;

      if (window.location.hash.indexOf('#/') === 0) {
        currentLocale = window.location.hash.split('/')[1];

        if (currentLocale === '' || state.supportedLocales.indexOf(currentLocale) === -1) {
          currentLocale = null;
        }
      }

      if (currentLocale === null) {
        currentLocale = state.defaultLocale;
      }

      if (state.currentLocale === currentLocale) {
        return;
      }

      state.currentLocale = currentLocale;

      if (this.state.startCallback) {
        this.state.startCallback();
      }

      var url = state.fileDir + '/' + state.fileName + '.' + state.currentLocale + '.json';

      if (state.langCache[url] !== undefined) {
        state.langText = state.langCache[url];
        i18n.updatePageTitle();

        if (state.loadedCallback) {
          state.loadedCallback();
        }
      } else {
        if (window.fetch !== undefined) {
          fetch(url, {
            mode: 'cors',
            cache: 'no-store',
            credentials: 'same-origin'
          }).then(function (response) {
            var status = response.status;

            if (status >= 200 && status < 300 || status === 304) {
              return Promise.resolve(response);
            } else {
              var error = 'Error loading data. Server Response Code: ' + status + ', Response Text: ' + response.statusText;
              return Promise.reject(error);
            }
          }).then(function (response) {
            return response.json();
          }).then(function (json) {
            state.langCache[url] = json;
          }).catch(function (error) {
            var errorMessage = 'Error Downloading I18N file: [' + url + '], Response Code Status: ' + error.message;
            console.error(errorMessage);
            state.langCache[url] = {};
          }).finally(function () {
            state.langText = state.langCache[url];
            i18n.updatePageTitle();

            if (state.loadedCallback) {
              state.loadedCallback();
            }
          });
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', url);

          xhr.onload = function () {
            var error = null;

            try {
              var status = this.status;

              if (status >= 200 && status < 300 || status === 304) {
                state.langCache[url] = JSON.parse(this.responseText);
              } else {
                error = 'Response Status Code: ' + status;
              }
            } catch (e) {
              error = e.toString();
            }

            if (error !== null) {
              var errorMessage = 'Error Downloading I18N file: [' + url + '], Error: ' + error;
              console.error(errorMessage);
              state.langCache[url] = {};
            }

            state.langText = state.langCache[url];
            i18n.updatePageTitle();

            if (state.loadedCallback) {
              state.loadedCallback();
            }
          };

          xhr.send();
        }
      }
    }
  }, {
    key: "updatePageTitle",
    value: function updatePageTitle() {
      var title = document.querySelector('html title[data-i18n]');

      if (title) {
        title.textContent = this.text(title.getAttribute('data-i18n'));
      }
    }
  }, {
    key: "text",
    value: function text(key) {
      return this.state.langText && this.state.langText[key] ? this.state.langText[key] : key;
    }
  }, {
    key: "currentLocale",
    get: function get() {
      return this.state.currentLocale;
    }
  }]);

  return I18n;
}();

exports.default = I18n;