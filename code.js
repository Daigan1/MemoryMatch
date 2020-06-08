  // credit: 



  //Info button [https://fontawesome.com/icons/info-circle?style=solid]
  //Cog Button [https://fontawesome.com/icons/cog?style=solid]
  //App background [https://i.stack.imgur.com/uD9js.png]
  // All card images and facedown card images [http://acbl.mybigcommerce.com/52-playing-cards/]
  // code for shuffling an array [https://gomakethings.com/how-to-shuffle-an-array-with-vanilla-js/]
  //main track [https://www.youtube.com/watch?v=63hoSNvS6Z4]
  // all sound effects are from code.org
  var cardList = [];
  var suiteList = ["C", "D", "H", "S"];
  var chosenCards = [];
  var score = 0;
  var moves = 0;
  var numberOfCards = 4;
  var time = 0;
  var userName = "";
  var inARow = 2;
  var cardNumber1;
  var cardSuite1;
  var cardNumber2;
  var cardSuite2;
  var setback;
  var selectedMode = "Default";
  var index1;
  var index2;
  var id;
  var players = 1;
  var cardListOriginal;
  var multiplayer = "false";
  var cardColor = "red";
  var userRecordId;
  var userNameTaken = false;
  var blitzActive = false;
  var blitzCount = 0;




  var userId = getUserId();

  readRecords("Players", {
      userId: userId
  }, function(records) {
      if (records.length == 0) {
          createRecord("Players", {
              id: userRecordId,
              userId: userId,
              cardColor: cardColor,
              username: userName,
              selectedMode: selectedMode,
              multiplayer: multiplayer,
              numberOfCards: numberOfCards
          }, function(records2) {
              userRecordId = records2.id;
          });
      } else {
          userRecordId = records[0].id;
          cardColor = records[0].cardColor;
          setText("nameInput", records[0].username);
          setText("gameModeSelector", records[0].selectedMode);
          setText("multiplayerCheckBox", records[0].multiplayer);
          setText("numberOfCardsSelector", records[0].numberOfCards);

      }
  });




  onEvent("startButton", "click", function() {
      setUpGame();
  });

  onEvent("giveUpButton", "click", function() {
      if (multiplayer == true) {




          readRecords("Lobbies", {
              id: id
          }, function(records) {
              if (records[0].id == id) {
                  updateRecord("Lobbies", {
                      id: id,
                      players: 2,
                      cardList: cardListOriginal,
                      winner: false,
                      disconnected: true,
                      gamemode: selectedMode
                  });
              }
          });
      }




      stopSound("assets/tetris.mp3");
      playSound("assets/category_hits/8bit_splat.mp3");
      setScreen("startPage");
      resetGame();


  });

  onEvent("leaderboardsButton", "click", function() {
      readRecords("Leaderboards", {}, function(records) {
          for (var i = 0; i < records.length; i++) {
              setText("name" + i, records[i].Name);
              setText("category" + i, records[i].Category + " cards");
              setText("time" + i, records[i].Time + " seconds");
          }
      });
      setScreen("leaderboardsPage");
      playSound("assets/category_app/app_button_1.mp3");
  });




  onEvent("goBackLeaderboards", "click", function() {
      setScreen("startPage");
      playSound("assets/category_app/app_button_1.mp3");
  });

  onEvent("goBackVictory", "click", function() {
      setProperty("worldRecordLabel", "hidden", true);
      setScreen("startPage");
      playSound("assets/category_app/modern_ui_sound.mp3");
  });


  onEvent("nameInput", "input", function() {
      userName = getText("nameInput");
      if (userName.length > 8) {
          playSound("assets/category_retro/retro_game_echo_error_2.mp3");
          userName = userName.slice(0, 8);
          setText("nameInput", userName);
          setProperty("nameErrorLabel", "hidden", false);
          setTimeout(function() {
              setProperty("nameErrorLabel", "hidden", true);
          }, 2000);

      }

  });


  //parent algorithm
  function setUpGame() {
      userNameTaken = false;
      userName = getText("nameInput");
      readRecords("Players", {}, function(records) {
          for (var i = 0; i < records.length; i++) {
              if (records[i].username == userName && records[i].id != userRecordId) {
                  userNameTaken = true;
              }
          }


          if (userName.length == 0 || userNameTaken == true) {
              playSound("assets/category_retro/retro_game_echo_error_2.mp3");
              setProperty("nameErrorLabel", "hidden", false);
              setTimeout(function() {
                  setProperty("nameErrorLabel", "hidden", true);
              }, 2000);
          } else {


              selectedMode = getText("gameModeSelector");
              multiplayer = getChecked("multiplayerCheckBox");
              numberOfCards = parseInt(getText("numberOfCardsSelector"));
              updateRecord("Players", {
                  id: userRecordId,
                  userId: userId,
                  cardColor: cardColor,
                  username: userName,
                  selectedMode: selectedMode,
                  multiplayer: multiplayer,
                  numberOfCards: numberOfCards
              });


              if (multiplayer == true) {
                  setUpMultiplayer();
              } else {
                  playSound("assets/category_board_games/card_shuffle_1.mp3");
                  setTimeout(function() {
                      playSound("assets/tetris.mp3", true);
                  }, 500);
                  startTimer();
                  buildCardList();
                  generateCards();
              }

          }
      });

  }
  //child algorithm 1
  function buildCardList() {
      var card = 0;
      for (var i = 0; i < numberOfCards / 4; i++) {
          card++;
          for (var x = 0; x < 4; x++) {
              var selectedCard = card + suiteList[x];
              cardList.push(selectedCard);
          }
      }
      shuffle(cardList);
      console.log(cardList);
      console.log(cardList.length);
  }
  //child algorithm 2
  function generateCards() {
      var xAxis = -7;
      var yAxis = 30;
      for (var i = 0; i < numberOfCards; i++) {
          image(cardList[i], cardColor + "_back.png");
          if (i % 8 == 0 && !i == 0) {
              xAxis = -7;
              yAxis += 60;
          }
          setPosition(cardList[i], xAxis, yAxis, 53, 53);
          xAxis += 40;
          addEventListeners(cardList[i]);
      }

  }




  function addEventListeners(selectedCard) {
      onEvent(selectedCard, "click", function() {
          chosenCards.push(selectedCard);




          if (chosenCards.length <= 2 && !(chosenCards[0] == chosenCards[1])) {
              console.log(selectedCard);
              playSound("assets/category_board_games/card_flipping.mp3");
              if (blitzActive == false) {
                  setImageURL(selectedCard, selectedCard + ".png");
              } else {
                  setImageURL(selectedCard, cardColor + "_back.png");
              }
          }

          if (chosenCards[0] == chosenCards[1]) {
              chosenCards.pop();
          }

          if (chosenCards.length == 2) {
              cardNumber1 = chosenCards[0].slice(0, chosenCards[0].length - 1);
              cardSuite1 = chosenCards[0].slice(selectedCard.length - 1);
              cardNumber2 = chosenCards[1].slice(0, chosenCards[1].length - 1);
              cardSuite2 = chosenCards[1].slice(selectedCard.length - 1);
              console.log(cardNumber1);
              console.log(cardNumber2);
              console.log(cardSuite1);
              console.log(cardSuite2);
              setTimeout(checkIfCorrect, 1000);



          }



      });

      onEvent(selectedCard, "mouseover", function() {
          if (getImageURL(selectedCard) == cardColor + "_back.png") {
              setImageURL(selectedCard, cardColor + "_back_selected.png");

          }




      });


      onEvent(selectedCard, "mouseout", function() {
          if (getImageURL(selectedCard) == cardColor + "_back_selected.png") {
              setImageURL(selectedCard, cardColor + "_back.png");

          }




      });
  }




  function shuffle(array) {

      var currentIndex = array.length;
      var temporaryValue, randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;

          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
      }

      return array;

  }



  function opposite(card) {
      var pair;
      if (card == "C") {
          pair = "S";
      } else if (card == "D") {
          pair = "H";
      } else if (card == "H") {
          pair = "D";
      } else if (card == "S") {
          pair = "C";
      }
      return pair;
  }



  function checkIfCorrect() {

      if (blitzActive == false) {
          setImageURL(chosenCards[0], cardColor + "_back.png");
          setImageURL(chosenCards[1], cardColor + "_back.png");
      } else {
          setImageURL(chosenCards[0], chosenCards[0] + ".png");
          setImageURL(chosenCards[1], chosenCards[1] + ".png");
      }
      if (cardNumber1 == cardNumber2 && cardSuite1 == opposite(cardSuite2) && (selectedMode == "Default" || selectedMode == "Blitz")) {
          updateScore();
      } else if (cardNumber1 == cardNumber2 && selectedMode == "Any Color") {
          updateScore();
      } else if (cardNumber1 == cardNumber2 && !(cardSuite1 == opposite(cardSuite2)) && selectedMode == "Zebra") {
          updateScore();
      } else if (selectedMode == "Blitz") {
          inARow = 2;
      }
      if (score == numberOfCards / 2 && multiplayer == true && !score == 0) {


          readRecords("Lobbies", {
              id: id
          }, function(records) {
              if (records[0].id == id) {
                  moves++;
                  updateRecord("Lobbies", {
                      id: id,
                      players: 2,
                      cardList: cardListOriginal,
                      winner: true,
                      disconnected: false,
                      gamemode: selectedMode
                  });
                  checkWinner();
              }
          });

      } else if (score == numberOfCards / 2 && !score == 0) {
          moves++;
          checkWinner();
      } else {
          moves++;
          updateText();
          chosenCards = [];
      }


  }


  function updateText() {
      setText("scoreLabel", "Matches: " + score);
      setText("movesLabel", "Moves: " + moves);

  }




  function resetGame() {
      for (var i = 0; i < cardList.length; i++) {
          deleteElement(cardList[i]);
      }
      stopTimedLoop();
      score = 0;
      moves = 0;
      players = 1;
      cardList = [];
      chosenCards = [];
      updateText();
      setText("lobbyWaitText", "Waiting for players to join your lobby...");
  }



  function checkWinner() {
      stopSound("assets/tetris.mp3");
      playSound("assets/category_female_voiceover/you_win_female.mp3");
      setText("winLabel", "Congrats, " + userName + "! You beat the " + selectedMode + " gamemode with " + numberOfCards + " cards");
      if (selectedMode != "Blitz") {
          setText("winnerScoresLabel", "You won in " + moves + " moves and in " + time + " seconds");
      } else {
          setText("winnerScoresLabel", "You won in " + moves + " moves, in " + time + " seconds and activated Blitz " + blitzCount + " times.");
      }
      setScreen("victoryPage");
      checkWorldRecord();
  }




  function checkWorldRecord() {


      readRecords("Leaderboards", {
          Category: numberOfCards
      }, function(records) {
          id = records[0].id;
          console.log(id);
          if (time < records[0].Time && selectedMode == "Default") {
              setProperty("worldRecordLabel", "hidden", false);
              updateRecord("Leaderboards", {
                  id: id,
                  Name: userName,
                  Category: numberOfCards,
                  Time: time
              });
          }

          resetGame();
      });
  }


  function updateScore() {
      score++;
      inARow++;
      updateText();
      deleteElement(chosenCards[0]);
      deleteElement(chosenCards[1]);
      index1 = cardList.indexOf(chosenCards[0]);
      cardList.splice(index1, 1);
      index2 = cardList.indexOf(chosenCards[1]);
      cardList.splice(index2, 1);
      chosenCards = [];
      console.log(score);
      blitzFunction();


  }
//written by my partner
  function blitzFunction() {
      if (inARow >= 3 && selectedMode == "Blitz") {
          blitzActivate();
          blitzContinue();
          blitzCount++;
      }
  }
//written by my partner
  function blitzActivate() {
      if (blitzActive == false) {
          blitzActive = true;
          for (var i = 0; i < cardList.length; i++) {
              setImageURL(cardList[i], cardList[i] + ".png");
          }
          setback = setTimeout(function() {
              for (var i = 0; i < cardList.length; i++) {
                  setImageURL(cardList[i], cardColor + "_back.png");
              }
              blitzActive = false;
          }, 3000);
      }
  }
//written by my partner
  function blitzContinue() {
      if (blitzActive == true) {
          clearTimeout(setback);
          setback = setTimeout(function() {
              for (var i = 0; i < cardList.length; i++) {
                  setImageURL(cardList[i], cardColor + "_back.png");
              }
              blitzActive = false;
          }, 3000);
      }
  }




  function startTimer() {
      time = 0;
      setText("timeLabel", "Time: " + time + " seconds");
      setScreen("gamePage");
      timedLoop(1000, function() {
          time++;
          if (time == 1) {
              setText("timeLabel", "Time: " + time + " second");
          } else {
              setText("timeLabel", "Time: " + time + " seconds");
          }
          if (multiplayer == true) {
              checkForWinMultiplayer();
          }

      });
  }




  function setUpMultiplayer() {


      readRecords("Lobbies", {
          players: 1
      }, function(records) {


          if (records.length == 0) {
              buildCardList();
              cardListOriginal = cardList.join();
              numberOfCards == cardList.length;
              createRecord("Lobbies", {
                  players: 1,
                  cardList: cardListOriginal,
                  winner: false,
                  disconnected: false,
                  gamemode: selectedMode
              }, function(records) {
                  id = records.id;

                  setScreen("lobbyWaitPage");
                  timedLoop(300, checkForSecondPlayer);
              });
          } else {
              selectedMode = records[0].gamemode;
              cardList = records[0].cardList.split(',');
              cardListOriginal = cardList.join();
              numberOfCards = cardList.length;
              id = records[0].id;
              updateRecord("Lobbies", {
                  id: id,
                  players: 2,
                  cardList: cardList.join(),
                  winner: false,
                  disconnected: false,
                  gamemode: selectedMode
              });



              hideElement("deleteLobby");
              setScreen("lobbyWaitPage");
              setText("lobbyWaitText", "Match found! You are playing with the " + selectedMode + " rules and with " + numberOfCards + " cards");
              setTimeout(function() {


                  multiplayerCountdown();




              }, 300);


          }




      });
  }



  function multiplayerCountdown() {
      var countdown = 3;
      timedLoop(1000, function() {
          setText("lobbyWaitText", countdown);
          countdown -= 1;
          if (countdown == 2) {
              playSound("assets/category_female_voiceover/three_female.mp3");
          } else if (countdown == 1) {
              playSound("assets/category_female_voiceover/two_female.mp3");
          } else if (countdown == 0) {
              playSound("assets/category_female_voiceover/one_female.mp3");
          } else if (countdown == -1) {
              playSound("assets/category_board_games/card_shuffle_1.mp3");
              setTimeout(function() {
                  playSound("assets/tetris.mp3", true);
              }, 500);
              stopTimedLoop();
              setScreen("gamePage");
              generateCards();
              startTimer();
              showElement("deleteLobby");
          }
      });
  }


  onEvent("deleteLobby", "click", function() {
      readRecords("Lobbies", {
          id: id
      }, function(records) {




          if (records[0].id == id) {
              deleteRecord("Lobbies", {
                  id: id
              });

              playSound("assets/category_app/perfect_app_button_2.mp3");

              setScreen("startPage");
              stopTimedLoop();
              score = 0;
              moves = 0;
              players = 1;
              numberOfCards = 0;
              cardList = [];
              chosenCards = [];
              setText("lobbyWaitText", "Waiting for players to join your lobby...");
          }
      });
  });



  function checkForSecondPlayer() {
      readRecords("Lobbies", {
          id: id
      }, function(records) {

          if (records[0].id == id && records[0].players == 2) {
              stopTimedLoop();
              hideElement("deleteLobby");
              multiplayerCountdown();

          }
      });
  }


  function checkForWinMultiplayer() {


      readRecords("Lobbies", {
          id: id
      }, function(records) {
          if (records[0].id == id && records[0].winner == true) {
              resetGame();
              setScreen("losePage");
              stopSound("assets/tetris.mp3");
              playSound("assets/category_female_voiceover/you_lose_female.mp3");
              deleteRecord("Lobbies", {
                  id: id
              });

          } else if (records[0].id == id && records[0].disconnected == true) {
              resetGame();
              setScreen("disconnectedPage");
              stopSound("assets/tetris.mp3");
              playSound("assets/category_female_voiceover/you_win_female.mp3");
              deleteRecord("Lobbies", {
                  id: id
              });
          }
      });
  }



  onEvent("disconnectButton", "click", function() {
      setScreen("startPage");
      resetGame();
  });

  onEvent("loseButton", "click", function() {
      setScreen("startPage");
      playSound("assets/category_app/modern_ui_sound.mp3");
  });


  onEvent("settingsButton", "click", function() {
      setScreen("settingsPage");
      updateColorText();

  });

  onEvent("redCard", "click", function() {
      cardColor = "red";
      updateColorText();
  });

  onEvent("yellowCard", "click", function() {
      cardColor = "yellow";
      updateColorText();
  });

  onEvent("purpleCard", "click", function() {
      cardColor = "purple";
      updateColorText();
  });

  onEvent("greenCard", "click", function() {
      cardColor = "green";
      updateColorText();
  });

  onEvent("blueCard", "click", function() {
      cardColor = "blue";
      updateColorText();
  });

  onEvent("grayCard", "click", function() {
      cardColor = "gray";
      updateColorText();
  });



  function updateColorText() {
      playSound("assets/category_app/pause_button.mp3");
      setText("cardColor", "Selected color: " + cardColor);
      updateRecord("Players", {
          id: userRecordId,
          userId: userId,
          cardColor: cardColor,
          username: userName,
          selectedMode: selectedMode,
          multiplayer: multiplayer,
          numberOfCards: numberOfCards
      });
  }


  onEvent("settingsDone", "click", function() {
      setScreen("startPage");
      playSound("assets/category_app/app_button_1.mp3");
  });




  onEvent("multiplayerCheckBox", "change", function() {
      playSound("assets/category_app/app_button_slide_cool_1.mp3");
  });