import * as model from './model.js';
import recipeView from './views/recipeView.js';
import serachView from './views/serachView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';

// import icons from '../img/icons.svg';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    // 0) Update result view to mark selected search result
    resultView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookmarks);

    // 1) Loding recipe
    await model.loadRecipe(id);

    // 2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultView.renderSpinner();
    console.log(resultView);

    //1 Get search query
    const query = serachView.getQuery();
    if (!query) return;

    //2 Load search result
    await model.loadSearchResult(query);

    //3 render results
    // resultView.render(model.state.search.results);
    resultView.render(model.getSearchResultsPage());

    // 4 Render initial pagination button
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (gotoPage) {
  // 1) Render NEW results
  resultView.render(model.getSearchResultsPage(gotoPage));
  // 2)Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServing = function (newServing) {
  //Update the recipe serving (in state)
  model.updateServings(newServing);
  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/ remove bookmark

  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else if (model.state.recipe.bookmarked)
    model.deleteBookmark(model.state.recipe.id);

  //2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    await model.uploadRecipe(newRecipe);
  } catch (err) {
    console.error('*', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServing(controlServing);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  serachView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

// controlServing();
