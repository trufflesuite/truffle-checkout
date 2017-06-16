function applySpacing(depth, lines) {
  var spacing = Array(depth + 1).join(" ");
  lines = lines.map(function(line) {
    return spacing + line;
  });
  return lines;
}

module.exports = function indent(logger, depth) {
  return {
    log: function() {
      var args = Array.prototype.slice.call(arguments);
      return logger.log.apply(logger, applySpacing(depth, args));
    },
    error: function() {
      var args = Array.prototype.slice.call(arguments);
      return logger.error.apply(logger, applySpacing(depth, args));
    }
  }
}
