# Moody-Mapper

Moody-Mapper is the mapping component of the [`Moody`](https://github.com/tsomic/moody) project. It is a tool for editing, creating and deleting facial expressions as well as mapping out the different images and their order. It also exports all necessary files to be used by the [`arduino`](https://github.com/tsomic/moody-arduino)

## How To Use

You should not clone this repository on its own but as part of the [`main repository`](https://github.com/tsomic/moody) (go there for details).

To use this tool, you need to run it locally.

```bash
cd moody-mapper
npm i
npm run dev
```

And then open [http://localhost:5173/](http://localhost:5173/).

To get started you firstly need to import all the necessary files. To do this, click the first button and select the main `moody` folder.  
This will import all the images from the [`moody-images`](https://github.com/tsomic/moody-images) repository and also the [config file](https://github.com/tsomic/moody-mapper/blob/main/facesConfig.json) that is located in this repository.

What you will see now is the complete default mapping of facial expressions:
![mapping.gif](https://raw.githubusercontent.com/tsomic/moody/main/assets/mapping.gif)

From here you can create, delete, edit and move faces and the connections between them.

Be aware that you cannot remove the `hot`, `cold` or `shock` facial expressions, because they are hard-coded into the Arduino project. You would firstly have to edit [that code](https://github.com/tsomic/moody-arduino/blob/main/moody/moody.ino) too.

To create a new face, simply right click the canvas anywhere and click on `New face`.  
This will prompt you to name the face. Once finished, a new node will appear on the top left of the canvas.

Double clicking on any node will open the face editor, containing a canvas for drawing and a few useful buttons below.  
Note that every face consists of two frames. You can toggle between these frames using the `Switch Layer` button.  
Once you are satisfied with the images, you can save and close the modal.

When you are finished mapping the faces to your liking you can save your changes, which writes to these three files:

- The [configuration file for the mapper](https://github.com/tsomic/moody-mapper/blob/main/facesConfig.json)
- The [configuration file for the arduino](https://github.com/tsomic/moody-arduino/blob/main/moody/facesConfig.h)
- The [image data file for the arduino](https://github.com/tsomic/moody-arduino/blob/main/moody/faces.h)

To apply the changes to the Arduino board, you of course need to flash the data once again.

## Contributing

Contributions are welcome! If you have ideas for new features, find any bugs, or would like to make improvements, please open an issue or submit a pull request.

## License

The Moody-Mapper project is licensed under the GNU GPLv3 license. See the [`LICENSE`](https://github.com/tsomic/moody-mapper/blob/main/LICENSE) file for more information.
