Name: Radia Tabassum


Overview
	The Tein Web Shop is a full-stack web application for buying and selling items.
	The application supports both registered and unregistered users,  registered users can 
	perform additional operations like adding items to buy, editing items, viewing their inventory, and purchasing items.



Backend:
   - Built using Django and Django REST Framework.
   - JSON API for shop operations and HTML landing page.
   - SQLite database integration.

Frontend:
   - Implemented using React.

Requirements :

	Automatic Database Population:
	    - Allows database to be reset and populated with test data via the landing page.
	    - first 3 user (testuser1,testuser2,testuser3) are seller (password : pass1,pass2,pass3)
	- rest (testuser4,5,6) are buyer
	    - Done


	Browse Items:
	    - List all available items with title, description, price, and date added.
	    - Done

	Create Account:
	    - Register a new user with username, email, and password.
	    - done

	Login:
	    - login using username and password.
	    - Admin : admin , pw: admin0606
	    - done

	Add item
	    - Authenticate user(seller, admin) can add a new item to sell
	    - Backend - done
	    - frontend - done

	Add to cart
	    - An authenticated user can select an item for purchase by adding it to the cart. -Done
	    - A user (buyer or seller) cannot add to the cart its own items - Done

	Search:
	    - Any user can search for items by title
	    - done

	Remove from the cart:
	    - an item can be removed from the cart by the buyer.
	    - done

	Pay:
	    - the buyer sees the list of items to be purchased. 
	-Done

	    - When pressing the “PAY” button: (proceed to checkout in the webshop)
	        a. If the price of an item has changed for any item in the cart, the cart
	        transaction is halted and
	            i. a notification will be shown next to the item, and
	            ii. the displayed price should be updated to the new price. - done

	        b. If an item is no longer available when the user clicks 'Pay', the whole cart
	        transaction is halted and a notification is shown to the user without removing
	        the item from the cart. The user can manually remove the unavailable items
	        and then Pay. - Done
	
	        c. On a successful Pay transaction, the status of each item in the cart becomes
	        SOLD. The bought items are listed as the buyer’s item (but they are not
	        available for sale). - Done

	Routing:
	    - The Shop page should be implemented as a SPA.
	- done

	Edit Account:
	    - an authenticated user should be able to change the password of the account by
	     providing the old and the new password - Done

	Display inventory:
	    - an authenticated user should be able to visualise his/her own items
	        displayed in 3 categories: on sale, sold, and purchased. - Done 

	Edit item:
	    - the seller of an item can edit the price of the item as long as the item is on
	    sale (available), via the Edit button, regardless of the item being added to any other
	    buyers’ carts. - Done

	Additional 
	- check out page
	- Order history 
	- Inventory page for seller

Prerequisites

To run this project, you need the following tools installed:

Backend (Django) - Python (version 3.9 or higher) - pip (Python package manager)

Frontend (React) - Node.js - npm (comes with Node.js)

How to Run the Project

Backend Setup

Create a virtual environment in Myshop folder
		python -m venv venv

Activate the Virtual Environment
	    source venv/bin/activate     or     venv\Scripts\activate(windows)


Navigate to the backend:
	    cd backend
Install Django and Required Libraries (requirement.txt) :

	  pip install -r requirements.txt
or

	  pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

Navigate to webshop_api folder:

	cd webshop_api
Start the Django development server:

python (or python3) manage.py runserver
The backend API will be available at http://127.0.0.1:8000.

Frontend Setup 1.Navigate to the frontend folder

cd frontend
2.Install dependencies:

npm install
3.Start the React development server:

	npm start
The frontend will be accessible at http://localhost:3000.
