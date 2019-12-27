import './css/base.scss';
import './css/style.scss';

import './images/person walking on path.jpg';
import './images/The Rock.jpg';

import $ from 'jquery';

import userData from './data/users';
import hydrationData from './data/hydration';
import sleepData from './data/sleep';
import activityData from './data/activity';

import User from './User';
import Activity from './Activity';
import Hydration from './Hydration';
import Sleep from './Sleep';
import UserRepo from './User-repo';

//refactor startApp into smaller functions? 
//lots of unused parameters 
//refactor to es6 

const startApp = () => {
  let userList = [];
  makeUsers(userList);
  //could have instantiation function 
  let userRepo = new UserRepo(userList);
  let hydrationRepo = new Hydration(hydrationData);
  let sleepRepo = new Sleep(sleepData);
  let activityRepo = new Activity(activityData);
  var userNowId = pickUser();
  let userNow = getUserById(userNowId, userRepo);
  let today = makeToday(userRepo, userNowId, hydrationData);
  let randomHistory = makeRandomDate(userRepo, userNowId, hydrationData);
  $('.historicalWeek').html(`Week of ${randomHistory}`)
  addInfoToSidebar(userNow, userRepo);
  addHydrationInfo(userNowId, hydrationRepo, today, userRepo, randomHistory);
  addSleepInfo(userNowId, sleepRepo, today, userRepo, randomHistory);
  let winnerNow = makeWinnerID(activityRepo, userNow, today, userRepo);
  addActivityInfo(userNowId, activityRepo, today, userRepo, userNow, winnerNow);
  addFriendGameInfo(userNowId, activityRepo, userRepo, today, userNow);
}



const makeUsers = (array) => {
  userData.forEach(function(dataItem) {
    let user = new User(dataItem);
    array.push(user);
  })
}

const pickUser = () => {
  return Math.floor(Math.random() * 50);
}

const getUserById = (id, listRepo) => {
  return listRepo.getDataFromID(id);
};


const addInfoToSidebar = (user, userStorage) => {
  $('#sidebarName').text(user.name);
  $('#headerText').text(`${ user.getFirstName() }'s Activity Tracker`);
  $('#stepGoalCard').text(`Your daily step goal is ${user.dailyStepGoal}.`);
  $('#avStepGoalCard').text(`The average daily step goal is ${userStorage.calculateAverageStepGoal()}`);
  $('#userAddress').text(user.address);
  $('#userEmail').text(user.email);
  $('#userStridelength').text(`Your stridelength is ${user.strideLength} meters.`);
  $('#friendList').html(makeFriendHTML(user, userStorage));
};

const makeFriendHTML = (user, userStorage) => {
  return user.getFriendsNames(userStorage)
    .map(friendName => `<li class='historical-list-listItem'>${friendName}</li>`)
    .join('');
}

const makeWinnerID = (activityInfo, user, dateString, userStorage) => {
  return activityInfo.getWinnerId(user, dateString, userStorage);
}

const makeToday = (userStorage, id, dataSet) => {
  var sortedArray = userStorage.makeSortedUserArray(id, dataSet);
  return sortedArray[0].date;
}

const makeRandomDate = (userStorage, id, dataSet) => {
  var sortedArray = userStorage.makeSortedUserArray(id, dataSet);
  return sortedArray[Math.floor(Math.random() * sortedArray.length + 1)].date
  
}

const addHydrationInfo = (id, hydrationInfo, dateString, userStorage, laterDateString) => {
  $('#hydrationToday').html(`<p>You drank</p><p><span class="number">${hydrationInfo.calculateDailyOunces(id, dateString)}</span></p><p>oz water today.</p>`);
  $('#hydrationAverage').html(`<p>Your average water intake is</p><p><span class="number">${hydrationInfo.calculateAverageOunces(id)}</span></p> <p>oz per day.</p>`);
  $('#hydrationThisWeek').html(makeHydrationHTML(hydrationInfo.calculateFirstWeekOunces(userStorage, id)));
  $('#hydrationEarlierWeek').html(makeHydrationHTML(hydrationInfo.calculateRandomWeekOunces(laterDateString, id, userStorage)));
}

const makeHydrationHTML = (method) => {
  return method
    .map(drinkData => `<li class="historical-list-listItem">On ${drinkData}oz</li>`)
    .join('');
}

const addSleepInfo = (id, sleepInfo, dateString, userStorage, laterDateString) => {
  $('#sleepToday').html(`<p>You slept</p> <p><span class="number">${sleepInfo.calculateDailySleep(id, dateString)}</span></p> <p>hours today.</p>`);
  $('#sleepQualityToday').html(`<p>Your sleep quality was</p> <p><span class="number">${sleepInfo.calculateDailySleepQuality(id, dateString)}</span></p><p>out of 5.</p>`);
  $('#avUserSleepQuality').html(`<p>The average user's sleep quality is</p> <p><span class="number">${Math.round(sleepInfo.calculateAllUserSleepQuality() * 100) / 100}</span></p><p>out of 5.</p>`);
  $('#sleepThisWeek').html(makeSleepHTML(sleepInfo.calculateWeekSleep(dateString, id, userStorage)));
  $('#sleepEarlierWeek').html(makeSleepHTML(sleepInfo.calculateWeekSleep(laterDateString, id, userStorage)));
}

const makeSleepHTML = (method) => {
  return method
    .map(sleepData => `<li class="historical-list-listItem">On ${sleepData} hours</li>`)
    .join('');
}

//not currently being called?
// function makeSleepQualityHTML(id, sleepInfo, userStorage, method) {
//   return method.map(sleepQualityData => `<li class="historical-list-listItem">On ${sleepQualityData}/5 quality of sleep</li>`).join('');
// }

const addActivityInfo = (id, activityInfo, dateString, userStorage, user, winnerId) => {
  $('#userStairsToday').html(`<p>Stair Count:</p><p>You</><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'flightsOfStairs')}</span></p>`);
  $('#avgStairsToday').html(`<p>Stair Count: </p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'flightsOfStairs')}</span></p>`);
  $('#userStepsToday').html(`<p>Step Count:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'numSteps')}</span></p>`);
  $('#avgStepsToday').html(`<p>Step Count:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'numSteps')}</span></p>`);
  $('#userMinutesToday').html(`<p>Active Minutes:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'minutesActive')}</span></p>`);
  $('#avgMinutesToday').html(`<p>Active Minutes:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'minutesActive')}</span></p>`);
  $('#userStepsThisWeek').html(makeStepsHTML(activityInfo.userDataForWeek(id, dateString, userStorage, "numSteps"))); 
  $('#userStairsThisWeek').html(makeStairsHTML(activityInfo.userDataForWeek(id, dateString, userStorage, "flightsOfStairs"))); 
  $('#userMinutesThisWeek').html(makeMinutesHTML(activityInfo.userDataForWeek(id, dateString, userStorage, "minutesActive"))); 
  $('#bestUserSteps').html(makeStepsHTML(activityInfo.userDataForWeek(winnerId, dateString, userStorage, "numSteps"))); 
}

const makeStepsHTML = (method) => {
  return method
    .map(activityData => `<li class="historical-list-listItem">On ${activityData} steps</li>`)
    .join('');
}

const makeStairsHTML = (method) => {
  return method
    .map(data => `<li class="historical-list-listItem">On ${data} flights</li>`)
    .join('');
}

const makeMinutesHTML = (method) => {
  return method
    .map(data => `<li class="historical-list-listItem">On ${data} minutes</li>`)
    .join('')z;
}

const addFriendGameInfo = (id, activityInfo, userStorage, dateString, user) => {
  $('#friendChallengeListToday').html(makeFriendChallengeHTML(activityInfo.showChallengeListAndWinner(user, dateString, userStorage)));
  $('#streakList').html(makeStepStreakHTML(activityInfo.getStreak(userStorage, id, 'numSteps'))); 
  $('#streakListMinutes').html(makeStepStreakHTML(activityInfo.getStreak(userStorage, id, 'minutesActive'))); 

  $('#friendChallengeListHistory').html(makeFriendChallengeHTML(activityInfo.showChallengeListAndWinner(user, dateString, userStorage))); 
  $('#bigWinner').text(`THIS WEEK'S WINNER! ${activityInfo.showcaseWinner(user, dateString, userStorage)} steps`);
}
  
const makeFriendChallengeHTML = (method) => {
  return method
    .map(friendChallengeData => `<li class="historical-list-listItem">Your friend ${friendChallengeData} average steps.</li>`)
    .join('');
}

const makeStepStreakHTML = (method) => {
  return method
    .map(streakData => `<li class="historical-list-listItem">${streakData}!</li>`)
    .join('');
}

startApp();
