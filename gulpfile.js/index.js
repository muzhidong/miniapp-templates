const {
  createSassFileTask,
  createSassFileWatchTask,
} = require('./createSassFileTask');
const {
  compileSassTask,
  compileSassWatchTask,
} = require('./compileSassTask');

exports.default = function() {

  // 当app文件夹下的wxss类型文件新增时，对应的scss类型文件也跟着生成。 
  createSassFileWatchTask();

  // 当app文件夹下有scss类型文件变化时，对应的wxss类型文件也时时跟着变化。
  compileSassWatchTask();

  // 启动时检查wxss是否有对应的scss文件，没有则创建。
  return createSassFileTask();

}

exports.compileSass = compileSassTask;