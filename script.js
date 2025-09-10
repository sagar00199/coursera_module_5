$(function () {
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

  var dc = {};

  var homeHtmlUrl = "snippets/home-snippet.html";
  var allCategoriesUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
  var categoriesTitleHtml = "snippets/categories-title-snippet.html";
  var categoryHtml = "snippets/category-snippet.html";
  var menuItemsUrl =
    "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
  var menuItemsTitleHtml = "snippets/menu-items-title.html";
  var menuItemHtml = "snippets/menu-item.html";

  // Convenience function
  var insertHtml = function (selector, html) {
    var targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
  };

  // Show loading spinner
  var showLoading = function (selector) {
    var html = "<div class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
  };

  // Replace {{propName}} with actual value
  var insertProperty = function (string, propName, propValue) {
    var propToReplace = "{{" + propName + "}}";
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
  };

  // ---------------- On Page Load -----------------
  document.addEventListener("DOMContentLoaded", function (event) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowHomeHTML, // callback
      true); // process JSON
  });

  // Build home page with random category
  function buildAndShowHomeHTML(categories) {
    $ajaxUtils.sendGetRequest(homeHtmlUrl, function (homeHtml) {
      // pick random category
      var randomCategory = chooseRandomCategory(categories);
      var randomCategoryShortName = randomCategory.short_name;

      // must wrap in quotes for JS function call
      homeHtml = insertProperty(
        homeHtml,
        "randomCategoryShortName",
        "'" + randomCategoryShortName + "'"
      );

      insertHtml("#main-content", homeHtml);
    }, false);
  }

  // Random category chooser
  function chooseRandomCategory(categories) {
    var randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  }

  // --------- Categories ---------
  dc.loadMenuCategories = function () {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      allCategoriesUrl,
      buildAndShowCategoriesHTML);
  };

  function buildAndShowCategoriesHTML(categories) {
    $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
      $ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml) {
        var finalHtml = categoriesTitleHtml + "<section class='row'>";
        for (var i = 0; i < categories.length; i++) {
          var html = categoryHtml;
          html = insertProperty(html, "name", categories[i].name);
          html = insertProperty(html, "short_name", categories[i].short_name);
          finalHtml += html;
        }
        finalHtml += "</section>";
        insertHtml("#main-content", finalHtml);
      }, false);
    }, false);
  }

  // --------- Menu Items ---------
  dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    $ajaxUtils.sendGetRequest(
      menuItemsUrl + categoryShort + ".json",
      buildAndShowMenuItemsHTML);
  };

  function buildAndShowMenuItemsHTML(categoryMenuItems) {
    $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
      $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
        menuItemsTitleHtml =
          insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
        menuItemsTitleHtml =
          insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemsTitleHtml + "<section class='row'>";

        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;

        for (var i = 0; i < menuItems.length; i++) {
          var html = menuItemHtml;
          html = insertProperty(html, "short_name", menuItems[i].short_name);
          html = insertProperty(html, "catShortName", catShortName);
          html = insertItemPrice(html, "price_small", menuItems[i].price_small);
          html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
          html = insertItemPrice(html, "price_large", menuItems[i].price_large);
          html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
          html = insertProperty(html, "name", menuItems[i].name);
          html = insertProperty(html, "description", menuItems[i].description);

          if (i % 2 !== 0) {
            html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
          }

          finalHtml += html;
        }

        finalHtml += "</section>";
        insertHtml("#main-content", finalHtml);
      }, false);
    }, false);
  }

  function insertItemPrice(html, pricePropName, priceValue) {
    if (!priceValue) {
      return insertProperty(html, pricePropName, "");
    }
    priceValue = "$" + priceValue.toFixed(2);
    return insertProperty(html, pricePropName, priceValue);
  }

  function insertItemPortionName(html, portionPropName, portionValue) {
    if (!portionValue) {
      return insertProperty(html, portionPropName, "");
    }
    portionValue = "(" + portionValue + ")";
    return insertProperty(html, portionPropName, portionValue);
  }

  global.$dc = dc;

})(window);
