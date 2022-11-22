# Neural-Network-Application
A prototype of web-based application that facilitates machine learning development on both web client and server platforms by using the TensorFlow.js framework. 
<br />

This is a part of my bachelor thesis at Ludwig Maximilian University of Munich and Inovex Gmbh, where one of the requirement is to build an prototype of a web application that can distribute ANNs models on both web browser and server platforms in four different scenarios.
<br />

With the help of TensorFlow.js, we will implement a web application prototype that supports sending artificial neural networks (ANNs) models from a client to a server and vice versa. Furthermore, the system would also allow dif- ferent processes of a machine learning pipeline, such as training or evaluating a model, to run interchangeably in these different environments.

-----
## Visualization of all four scenarios:
![4_scenarios_final](https://user-images.githubusercontent.com/57076116/202943687-a1c05e36-a631-4912-9fe1-d9eb261a83e1.png)

-----
## Structure of the prototype
The web application prototype provides a web interface that supports data loading, neural network configuration, and inference task. The prototype currently supports building and configuring feed-forward neural networks for classification problems.

The prototype’s overall UI design is comprised of several sections:

- Handle Data: This section allows loading, visualizing, and parsing data in a particular tabular format from a Comma-separated values (CSV) file. The data tabular format begins with the dataset’s attributes, and the subsequent lines are labeled numeric data records with the final column being the label. The section provides two methods for loading and parsing the data. The first one supports parsing data from CSV files on the local machine, which is used for scenarios 1, 2, and 4. The second option, which is employed in scenario 3, allows a user to choose an available data set and have it parsed on the server. 
- Configure parameters: This section supports configuring these model hyperparameters: test split percentage, number of epochs, number of hidden layers. For each layer, the user can specify the activation function and the number of neurons.
- Output: Display the loss and accuracy values of the model on the test set and data set. 
- Inference: This section enables making a prediction using manual input
- Browser log console: Contain information that keeps track of the processes.

## Here is the list of datasets available on the server:
[avila.csv](https://github.com/HoangGiang98/neural_network_application/files/10068509/avila.csv)

[iris.csv](https://github.com/HoangGiang98/neural_network_application/files/10068511/iris.csv)

[winequality-red.csv](https://github.com/HoangGiang98/neural_network_application/files/10068512/winequality-red.csv)

[winequality-white.csv](https://github.com/HoangGiang98/neural_network_application/files/10068513/winequality-white.csv)



## Example of the interface after executing a scenario:
![prototype_rest](https://user-images.githubusercontent.com/57076116/203348659-5cdd9562-89f1-419f-bd51-18c25e2d9040.png)


## Available Scripts

In the project directory, you can run:

### `npm start:dev`

Runs the app in the development mode in default port 8080.\
Open [http://localhost:8080/api/health](http://localhost:3000/api/health) to view it in the browser.
