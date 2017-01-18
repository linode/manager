process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  var changed = data.replace(/^TN:\n^.*styleguide[\s\S]*?^end_of_record$/gm, "");
  changed = changed.replace(/\n\n/gm,"");
  changed = changed.replace(/end_of_recordTN:/, "end_of_record\nTN:");
  process.stdout.write(changed);
});

