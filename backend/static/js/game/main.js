import { MyApp } from './MyApp.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import { MyContents } from './MyContents.js';

let app = new MyApp()
app.init()
console.log(app);

let contents = new MyContents(app)
contents.init()
app.setContents(contents);

let gui = new MyGuiInterface(app)
gui.setContents(contents)
gui.init();


app.render()