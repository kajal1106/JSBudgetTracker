var budgetController = (function() {
    var Expense = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };
   
    Expense.prototype.calculatePercentage = function(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round(this.value * 100 / totalIncome);
      } else {
        this.percentage = -1;
      }
    }
   
    Expense.prototype.getPercentage = function() {
      return this.percentage;
    }
   
    var Income = function(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    };
   
    var calculateTotal = function(type) {
      data.totals[type] = data.allItems[type].reduce(function(previous, current) {
        return previous + current.value;
      }, 0);
    }
   
    var data = {
      allItems: {
        inc: [],
        exp: [],
      },
      totals: {
        exp: 0,
        inc: 0,
      },
      budget: 0,
      percentage: -1,
      month: '',
      year: '',
    };
   
    return {
      addItem: function(type, description, value) {
        var newItem, ID;
        ID = data.allItems[type].length ? data.allItems[type][data.allItems[type].length - 1].id + 1 : 1;
   
        if (type === 'exp') {
          newItem = new Expense(ID, description, value);
        } else {
          newItem = new Income(ID, description, value);
        }
   
        data.allItems[type].push(newItem);
   
        return newItem;
      },
      calculateBudget: function() {
        calculateTotal('exp');
        calculateTotal('inc');
   
        data.budget = data.totals.inc - data.totals.exp;
   
        if (data.totals.inc > 0) {
          data.percentage = Math.round(data.totals.exp * 100 / data.totals.inc);
        } else {
          data.percentage = -1;
        }
   
        window.localStorage.setItem('budget', JSON.stringify(data));
      },
      calculatePercentages: function() {
        console.log(data.allItems)
        data.allItems.exp.forEach(function(expense) {
          Expense.prototype.calculatePercentage.call(expense, data.totals.inc);
        })
   
        window.localStorage.setItem('budget', data);
        window.localStorage.setItem('budget', JSON.stringify(data));
      },
      deleteItem: function(type, id) {
        var item = data.allItems[type].find(function(element) {
          return element.id === Number(id);
        })
   
        var indexOfElement = data.allItems[type].indexOf(item);
   
        if (indexOfElement !== -1) {
          data.allItems[type].splice(indexOfElement, 1);
        }
      },
      getBudget: function() {
        return {
          budget: data.budget,
          totalIncome: data.totals.inc,
          totalExpense: data.totals.exp,
          percentage: data.percentage,
        };
      },
      getPercentages: function() {
        return data.allItems.exp.map(function(expense) {
          return Expense.prototype.getPercentage.call(expense);
        });
      },
      getDate: function() {
        return {
          month: data.month,
          year: data.year,
        };
      },
      setDate: function(month, year) {
        data.month = month;
        data.year = year;
      },
      setData: function(existingData) {
        data = existingData;
      },
      testing: function () {
        return data;
      }
    }
  })();
   
  var UIController = (function() {
   
    var DOMStrings = {
      description: '.add__description',
      value: '.add__value',
      type: '.add__type',
      button: '.add__btn',
      incomeContainer: '.income__list',
      expenseContainer: '.expenses__list',
      totalIncome: '.budget__income--value',
      totalExpenses: '.budget__expenses--value',
      totalBudget: '.budget__value',
      expensePercentage: '.budget__expenses--percentage',
      container: '.container.clearfix',
      itemPercentage: '.item__percentage',
      monthLabel: '.budget__title--month',
    };
   
    var formatNumber = function(num, type) {
      var numSplit, int, dec, sign = '';
      num = Math.abs(num);
      num = num.toFixed(2);
      numSplit = num.split('.');
      int = numSplit[0];
   
      if (int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
      }
   
      dec = numSplit[1];
   
      if (num !== '0.00') {
              return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
      } else {
              return int + '.' + dec;
      } 
  };
   
    var nodeListForEach = function(list, callback) {
      for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
      }
    }
   
    return {
      addListItem: function(budgetItem, type) {
        var html, newHtml, elementContainer;
      // Create HTML string with placeholder text
  
   
        if (type === 'inc') {
          elementContainer = DOMStrings.incomeContainer;
          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        } else {
          elementContainer = DOMStrings.expenseContainer;
          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
   
        newHtml = html.replace('%id%', budgetItem.id).replace('%description%', budgetItem.description).replace('%value%', formatNumber(budgetItem.value, type));
   
        document.querySelector(elementContainer).insertAdjacentHTML('beforeend', newHtml);
      },
      changeType: function() {
        var fields = document.querySelectorAll(
          DOMStrings.type + ',' +
          DOMStrings.value + ',' +
          DOMStrings.description
        );
   
        nodeListForEach(fields, function(element) {
          element.classList.toggle('red-focus')
        });
   
        document.querySelector(DOMStrings.button).classList.toggle('red');
      },
      clearFields: function() {
        var fields, fieldsArr;
        fields = document.querySelectorAll(DOMStrings.value + ', ' +DOMStrings.description);
   
        fieldsArr = Array.prototype.slice.call(fields);
   
        fieldsArr.forEach(function(field) {
          field.value = '';
        });
   
        fieldsArr[0].focus();
      },
      displayBudget: function(budgetObj) {
        var type = budgetObj.budget >= 0 ? 'inc' : 'exp';
   
        document.querySelector(DOMStrings.totalBudget).textContent = formatNumber(budgetObj.budget, type);
        document.querySelector(DOMStrings.totalIncome).textContent = formatNumber(budgetObj.totalIncome, 'inc');
        document.querySelector(DOMStrings.totalExpenses).textContent = formatNumber(budgetObj.totalExpense, 'exp');
   
        if (budgetObj.percentage >= 0) {
          document.querySelector(DOMStrings.expensePercentage).textContent = budgetObj.percentage + '%';
        } else {
          document.querySelector(DOMStrings.expensePercentage).textContent = '---';
        }
      },
      displayPercentages: function(percentages) {
        var percentagesFields = document.querySelectorAll(DOMStrings.itemPercentage);
   
        nodeListForEach(percentagesFields, function(current, index) {
          if (percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
        });
      },
      displayDate: function (month, year) {
        document.querySelector(DOMStrings.monthLabel).textContent = month + ' ' + year;
      },
      getInput: function() {
        return {
          description: document.querySelector(DOMStrings.description).value,
          value: Number(document.querySelector(DOMStrings.value).value),
          type: document.querySelector(DOMStrings.type).value,
        };
      },
      getDOMStrings: function() {
        return DOMStrings;
      },
      removeListItem: function(id) {
        document.getElementById(id).remove();
      },
      validateInput: function(event) {
        if (Number(event.target.value) < 0) {
          document.querySelector(DOMStrings.value).value = 0;
        }
      }
    }
  })();
   
  var controller = (function(budgetCtrl, UICtrl) {
    var addItem = function() {
      var input, addedItem;
      /*
        1. Get field input data
        2. Add the item to the budget controller
        3. Add the item to the UI
        4. Clear fields
        5. Calculate and update budget
        6. Calculate and update expense percentages
      */
      input = UICtrl.getInput();
   
      if (input.description && input.value) {
        addedItem = budgetCtrl.addItem(input.type, input.description, input.value);
        UICtrl.addListItem(addedItem, input.type);
        UICtrl.clearFields();
        updateBudget();
        updatePercentages();
      }
    };
   
    var deleteItem = function(event) {
      var itemID;
   
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
   
      if (itemID) {
         var splittedID = itemID.split('-');
         budgetCtrl.deleteItem(splittedID[0], splittedID[1]);
         updateBudget();
         updatePercentages();
         UICtrl.removeListItem(itemID);
      }
    };
   
    var setupEventListeners = function() {
      var DOMStrings = UICtrl.getDOMStrings();
   
      document.querySelector(DOMStrings.button).addEventListener('click', addItem);
      document.addEventListener('keypress', function(event) {
        if (event.keyCode === 13 || event.which === 13) {
          addItem();
        }
      });
   
      document.querySelector(DOMStrings.container ).addEventListener('click', deleteItem);
      document.querySelector(DOMStrings.type).addEventListener('change', UICtrl.changeType);
      document.querySelector(DOMStrings.value).addEventListener('input', UICtrl.validateInput);
    };
   
    var updateBudget = function() {
      /*
        1. Calculate the budget
        2. Return the budget
        3. Display the budget
      */
     budgetCtrl.calculateBudget();
     var budget = budgetCtrl.getBudget();
     UICtrl.displayBudget(budget);
    };
   
    var updatePercentages = function() {
      budgetCtrl.calculatePercentages();
      UICtrl.displayPercentages(budgetCtrl.getPercentages());
    };
   
    var updateDate = function() {
      var date, year, month, months;
      date = new Date();
      year = date.getFullYear();
      month = date.getMonth();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
   
      UICtrl.displayDate(months[month], year);
      budgetCtrl.setDate(month, year);
    }
   
    return {
      init: function() {
        updateDate();
        currentDate = budgetCtrl.getDate();
        var localStorageBudget = JSON.parse(window.localStorage.getItem('budget'));
   
        if (localStorageBudget && localStorageBudget.month === currentDate.month && localStorageBudget.year === currentDate.year) {
          budgetCtrl.setData(localStorageBudget);
          localStorageBudget.allItems.inc.forEach(function(income) {
            UICtrl.addListItem(income, 'inc');
          });
   
          localStorageBudget.allItems.exp.forEach(function(income) {
            UICtrl.addListItem(income, 'exp');
          });
          updateBudget();
          updatePercentages();
        }
   
        UICtrl.displayBudget(budgetCtrl.getBudget());
        setupEventListeners();
      }
    }
  })(budgetController, UIController);
   
   
  controller.init();
