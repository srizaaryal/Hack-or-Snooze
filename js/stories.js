"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  // console.log(storyList);
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  return $(`
      <li id="${story.storyId}">
      <div>
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${Boolean(currentUser) ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${story.getHostName()})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </div>
      </li>
    `);
}

function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  storyList.stories.map((story) => {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
    console.log($story);
  });

  $allStoriesList.show();
}

async function delStory(evt) {
  console.debug("delStory");
  const $closestLi = $(evt.target).closest("li");
  const storyId = $closestLi.attr("id");
  await storyList.removeStory(currentUser, storyId);

  await putStoriesOnPage();
}
$myStories.on("click", ".trash-can", delStory);

// Submit new stories

async function submitNewStory(evt) {
  console.debug("submitNewStory");
  evt.preventDefault();

  const title = $("#title").val();
  const url = $("#url").val();
  const author = $("#author").val();
  const username = currentUser.username;
  const storyData = { title, url, author, username };
  console.log(storyData);

  const story = await storyList.addStory(currentUser, storyData);

  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitNewStory);

function putFavoritesListOnPage() {
  console.debug("putFavoritesListOnPage");

  $favoritedStories.empty(); //ensures that there is no duplicate entry of favourites

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append(
      "<h5>Currently there are no favorites stories added!</h5>"
    );
  } else {
    currentUser.favorites.map((story) => {
      //users favouriting their stories will be stored in an array which is currentUser.favourites
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    });
  }
  $favoritedStories.show();
}

$favoritedStories.on("click", ".star", toggleStoryFavorite);

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($tgt.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$allStoriesList.on("click", ".star", toggleStoryFavorite);

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");
  // console.log(currentUser.ownStories);
  $myStories.empty();

  if (currentUser.ownStories.length === 0) {
    $myStories.append("<h5>No stories added by user yet!</h5>");
  } else {
    currentUser.ownStories.map((story) => {
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    });
  }

  $myStories.show();
}
$myStories.on("click", ".star", toggleStoryFavorite);
