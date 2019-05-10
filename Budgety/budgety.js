var budgetController = (function(){
	var Expense = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var Income = function(id,description,value){
		this.id = id;
		this.description = description;
		this.value = value;

	};
	var data = {
		allItems:{
			inc:[],
			exp:[]
		},
		totals:{
			exp:0,
			inc:0

		},
		budget:0,
		percentage:-1
	};
	var calctotals = function(type)
	{
		var sum =0;
		data.allItems[type].forEach(function(cur)
		{
			sum+=cur.value;
		});
		data.totals[type] = sum;
	}
	return{
		addItem:function(type,des,val)
		{
			var newItem,ID;
			if(data.allItems[type].length > 0)
			{
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}
			else{
				ID=0;
			}
			
			if(type==="exp")
			{
				newItem = new Expense(ID,des,val);
			}
			else
			{
				newItem = new Income(ID,des,val);
			}
			data.allItems[type].push(newItem);
			return newItem;
		},
		calculate:function()
		{
			//calc total inc and exp
			calctotals('exp');
			calctotals('inc');
			//calc budget
			data.budget = data.totals.inc - data.totals.exp;
			//calc percentages
			if(data.totals.inc > 0)
			{
				data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
			}
			else
			{
				data.percentage = -1;
			}
		},
		getBudget:function(){
			return{
				exp:data.totals.exp,
				inc:data.totals.inc,
				budget:data.budget,
				percentage:data.percentage
			}
		},
		del:function(type,id){
			var index,ids;
			ids = data.allItems[type].map(function(cur){
				return cur.id;
			});
			index = ids.indexOf(id);
			if(index !== -1)
			{
				data.allItems[type].splice(index,1);
			}
			

		},
		testing:function(){
			console.log(data);
		}
	};
	

})();

var UIController=(function(){
	var domStrings = {
		selection:'.select',
		des:'.input',
		val:'.value',
		addbutton:'.addbutton',
		incomelist:'.incomelist',
		expenselist:'.expenselist',
		totalbudget:'.budget',
		totalincome:'.totalincome',
		totalexpense:'.totalexpenses',
		exppercent:'.exppercent',
		bottom:'.bottom',
		date:'.date'
	};
	
	return{
			getinput:function()
			{
				return{
					 selected: document.querySelector(domStrings.selection).value,
					 description: document.querySelector(domStrings.des).value,
					 value: parseFloat(document.querySelector(domStrings.val).value)

				};
				
			},
			addNewItem:function(obj,type){
				var html,newHtml,element;

				if(type==="inc")
				{
					element = domStrings.incomelist;
					html = '<div class="income" id="inc-%id%">	<p class="description">%description%</p><p class="val">%value%</p><button><i class="ion-ios-close-outline"></i></button></div>'
				}
				else{
					element = domStrings.expenselist;
					html = '<div class="expense" id="exp-%id%"><p class="description">%description%</p><p class="val">%value%</p><button><i class="ion-ios-close-outline"></i></button></div>'
				}
				newHtml=html.replace('%id%',obj.id);
				newHtml=newHtml.replace('%description%',obj.description);
				newHtml=newHtml.replace('%value%',obj.value);

				document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
			},
			getDomStrings:function()
			{
				return domStrings;
			},
			clearfields:function()
			{
				var fields,fieldsArr;
				fields = document.querySelectorAll(domStrings.des+', '+domStrings.val);//returns list
				fieldsArr = Array.prototype.slice.call(fields);//using array objects method on list object
				fieldsArr.forEach(function(cur,index,arr){
						cur.value="";

				});
				fieldsArr[0].focus();//to return cursor or focus back to description field
			},
			displayBudget:function(obj)
			{
				document.querySelector(domStrings.totalbudget).textContent = obj.budget;
				document.querySelector(domStrings.totalincome).textContent = '+' + obj.inc;
				document.querySelector(domStrings.totalexpense).textContent = '-' + obj.exp;
				if(obj.percentage > 0)
				{
					document.querySelector(domStrings.exppercent).textContent = obj.percentage + '%';
				}
				else
				{
					document.querySelector(domStrings.exppercent).textContent = '---';
				}
				

			},
			del:function(id)
			{
				var el = document.getElementById(id);
				el.parentNode.removeChild(el);
			},
			date:function()
			{
				var year,month,now;
				now = new Date();
				year = now.getFullYear();
				var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
				month = now.getMonth();
				document.querySelector(domStrings.date).textContent = months[month] + " " + year;
			}
	};
	

})();

var appController=(function(budgetctrl,UIctrl){
	var dom = UIctrl.getDomStrings();
	var setupEventListeners = function()
	{
		UIctrl.date();
		document.querySelector(dom.addbutton).addEventListener('click',myFunc);
		document.addEventListener('keypress',function(event){
			if(event.keycode===13 || event.which===13)
			{
				myFunc();
			}
		});
		document.querySelector(dom.bottom).addEventListener('click',deleteItem);
	};
	var calcBudget = function()
	{
		//calculate budget
		budgetctrl.calculate();
		//return budget
		var budget = budgetctrl.getBudget();
		//display budget on ui
		UIctrl.displayBudget(budget);
	};
	var myFunc = function(){
		var input = UIctrl.getinput();//get input from fields
		
		if(input.description !== "" && !isNaN(input.value) && input.value !== 0)
		{
			var add = budgetctrl.addItem(input.selected,input.description,input.value);//add item in data structure
			UIctrl.addNewItem(add,input.selected);//add item in UI
			UIctrl.clearfields();//clear input fields
			calcBudget();

		}
		
	};
	var deleteItem = function(event)
	{
		var itemId,splitId;
		itemId = event.target.parentNode.parentNode.id;
		
		if(itemId)
		{
			splitId = itemId.split('-');
			type = splitId[0];
			id = parseInt(splitId[1]);

			budgetctrl.del(type,id);

			UIctrl.del(itemId);

			calcBudget();
		}
	}
	return{
		init:function()
		{

			return setupEventListeners();
		}
	}
	

})(budgetController,UIController);

appController.init();