# Moody-Mapper

Moody-Mapper is the mapping component of the [`Moody`](https://github.com/tsomic/moody) project. It contains a tool to map out the different facial expressions and their order. It also exports that mapping as a `facesConfig.h` file that is used by [`moody-arduino`](https://github.com/tsomic/moody-arduino).

<br/>

## How To Use

You should not clone this repository on its own but as part of the [`main repository`](https://github.com/tsomic/moody) (go there for details).

<!-- To use this tool, open the [`index.html`](https://github.com/tsomic/moody-mapper/blob/main/src/index.html) in any browser. -->

To get started you firstly need to import all the necessary files. To do this, click the first button and select the main `moody` folder.  
This will import all the images from the [`moody-images`](https://github.com/tsomic/moody-images) repository and also the [config file](https://github.com/tsomic/moody-mapper/blob/main/facesConfig.json) that is located in this repository.

What you will see now is the complete default mapping of facial expressions:
![mapping.gif](https://raw.githubusercontent.com/tsomic/moody/main/assets/mapping.gif)

From here you can move the faces around, create, delete or move the connections.  
Once you are satisfied with the mapping you can save your changes, which writes to the mapping configuration files for both the [mapper](https://github.com/tsomic/moody-mapper/blob/main/facesConfig.json) and the [arduino](https://github.com/tsomic/moody-arduino/blob/main/moody/facesConfig.h). To apply the changes to the Arduino, you of course need to flash the data once again.

To add new faces, just follow the guidelines of the [`moody-images`](https://github.com/tsomic/moody-images) project. The new face will appear in the mapper after another import (don't forget to save before reimporting!).

<br/>

## Contributing

Contributions are welcome! If you have ideas for new features, find any bugs, or would like to make improvements, please open an issue or submit a pull request.

<br/>

## License

The Moody-Mapper project is licensed under the GNU GPLv3 license. See the [`LICENSE`](https://github.com/tsomic/moody-mapper/blob/main/LICENSE) file for more information.
