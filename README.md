# Moody-Mapper

Moody-Mapper is the mapping component of the [`Moody`](https://github.com/tsomic/moody) project. It contains a tool to map out the different facial expressions and their order. It also exports that mapping as a `facesConfig.h` file that is used by [`moody-arduino`](https://github.com/tsomic/moody-arduino).

<br/>

## How To Use

You should not clone this repository on its own but as part of the [`main repository`](https://github.com/tsomic/moody) (go there for details).

To use this tool, open the [`index.html`](https://github.com/tsomic/moody-mapper/blob/main/src/index.html) in any browser.

To get started I recommend firstly importing all the images of the [`moody-images`](https://github.com/tsomic/moody-images) repository via the first button on the left. Only `JPEG`, `PNG` and `BMP` files are supported.

Now you will see all the possible faces but they are still pretty unordered.  
To see the default configuration of the project, you now have to import the [`facesConfig.json`](https://github.com/tsomic/moody-mapper/blob/main/facesConfig.json) file using the second button from the left. The file is located in the root of this project.

What you will see now is the complete default mapping of facial expressions:
<img src="https://raw.githubusercontent.com/tsomic/moody/main/assets/mapping.gif"/>

From here you can move the faces around, create, delete or move the connections and save the configuration if you're satisfied.  
The third button from the left downloads the `facesConfig.h` file that you can then move to the Arduino folder and the rightmost button saves the configuration as `json` so you can import it again next time.

Be aware that it is currently not very user friendly to just add a new facial expression to the project. You basically have to either manually edit the `facesConfig.json` or recreate the whole mapping.

<br/>

## Contributing

Contributions are welcome! If you have ideas for new features, find any bugs, or would like to make improvements, please open an issue or submit a pull request.

<br/>

## License

The Moody-Mapper project is licensed under the GNU GPLv3 license. See the [`LICENSE`](https://github.com/tsomic/moody-mapper/blob/main/LICENSE) file for more information.
