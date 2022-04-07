// BUdget COntroller
var budgetController = (function () {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
        
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {

            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {

            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function() {

        return this.percentage;
    }
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {

        var sum = 0;

        data.allItems[type].forEach(function(cur) {
            
            sum += cur.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
            
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentages: -1
    };

    return {
        addItem: function(type, des, val) {

            var newItem, ID;
            
            // the ID shld be last ID + 1
            // create new ID

            if(data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                
                ID = 0;
            }
            
            // create new item based on 'inc' or 'exp'
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push it to our data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        }, 

        deleteItem: function(type, id) {
            // the value of your "type" parameter is either "income" or "expense" instead of "inc" or "exp" this caused it to be undefined, 
            var ids, index;

            // loop over the array to get the index of the item we want to delete. using map function
            
            data.allItems[type].splice(id, 1) // just do this, No need for  all the codes below
            

            //ids = data.allItems[type]; 

            // ids.map(function(current) {
            //     console.log(current)

            //     return current.id; // you used current.ID which doesn't exist. what you shoud have done is current.id
            // });

            // console.log(id)

            // index = ids.indexOf(id);

            // if(index !== -1) {

            //     data.allItems[type].splice(index, 1);
            // }
        },

        calculateBudget: function() {

            // calculate the total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //  calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //  calculate the percentage of income spent
            if(data.totals.inc > 0) {

                data.percentages = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentages = -1;
            }

        },

        calculatePercentages: function() {

            data.allItems.exp.forEach(function(curr) {

                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function() {

            var allPerc = data.allItems.exp.map(function(cur) {

                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentages
            }
        },

        testing: function() {
            console.log(data);
        }
    };

}) ();



// UI Controller
var UIController = (function() {

    var DOMStrings = {
        inputType: '.add-select',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputButton: '.add-button',
        incomeContainer: '.income-list',
        expensesContainer: '.expenses-list',
        budgetLabel: '.budget-value',
        incomeLabel: '.income-value',
        expensesLabel: '.expenses-value',
        percentLabel: '.expenses-percentage',
        container: '.list-row',
        expensesPercLabel: '.expenses-percent',
        dateLabel: '.month-title'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if(int.length > 3) {

            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }


        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {

        for(var i = 0; i < list.length; i++) {

            callback(list[i], i);

        }

    };

    return {
        getInput: function() {

            return {
             type: document.querySelector(DOMStrings.inputType).value, // will be either inc or exp
             description: document.querySelector(DOMStrings.inputDescription).value,
             value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
            
        }, 

        addListItem: function(obj, type) {
            var html, newHtml, element;
            // create HTML string with a placeholder text

            if(type === 'inc') {
                element = DOMStrings.incomeContainer;

                html = '<div class="income-list-item d-md-flex justify-content-between p-1" id="inc-%id%"> <h5 class="income-item-description">%description%</h5> <h5 class="text-success income-item-value">%value%</h5><span class="text-danger px-1 fs-5 close">&times;</span> </div>'; // i changed the id from income to inc

            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;

                html = '<div class="expenses-list-item d-md-flex justify-content-between p-1" id="exp-%id%"><h5 class="expenses-item-description">%description%</h5><h5 class="text-danger expenses-item-value">%value% <span class="expenses-percent text-danger p-1">- 40%</span> </h5> <span class="text-danger px-1 fs-5 close">&times;</span></div>'; // i changed the id from expense to exp

            }


            //  replace the placeholder text with real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);

            el.parentNode.removeChild(el);// you forgot to insert the child element that should be removed in the brackets which is "el"
            
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' +  DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, Array) {
                current.value = '';
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp'; 

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {

                document.querySelector(DOMStrings.percentLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentLabel).textContent = '---';
            }
        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index) {

                if(percentages[index] > 0) {

                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
                

            });

        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();

            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            var fields = document.querySelectorAll(

                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(curr) {

                curr.classList.toggle('.red-focus');

            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('.red');

        },

        getDOMStrings: function() {

            return DOMStrings;
        }
    }

}) ();




// App Controller
var controller = (function(budgetCtrl, UICtrl) {
    
    var DOM = UICtrl.getDOMStrings();

    var setUpEventListeners = function() {

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);



        document.addEventListener('keypress', function(event) {

            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    
    var updateBudget = function() {

        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();

        // 3.dislay the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function() {

        // 1. Calculate the percentages 
        budgetCtrl.calculatePercentages();

        // 2. read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update the budget
            updateBudget();

            // 6. update the new percentages 
            updatePercentages();

        }  

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

         console.log(event.target.parentNode);

        itemID = event.target.parentNode.id;

        if(itemID) {

            // income-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget();

            // 4. update the new percentages
            updatePercentages();

        }

    }

    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setUpEventListeners();
        }
    }

    
}) (budgetController, UIController);

controller.init();



//i commented on line: 76, 81, 175, 180, 198