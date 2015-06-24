/*jslint browser: true */

function CheckboxSequence(container) {
  // `previous_checkbox` is the last clicked checkbox element
  var previous_checkbox = this.previous_checkbox = null;
  // `previous_checked` is the resulting checked status of the last clicked
  // checkbox element (unchecked->checked: true, checked->unchecked: false)
  var previous_checked = this.previous_checked = null;
  // listen for clicks on the containing element
  container.addEventListener('click', function containerClick(ev) {
    // but only do anything with clicks on checkboxes
    if (ev.target.getAttribute('type') == 'checkbox') {
      var current_checkbox = ev.target;
      var current_checked = current_checkbox.checked;
      // only connect between two checkboxes if they were both turned to
      // the same checked status, and shift is being held down
      if (ev.shiftKey && previous_checkbox && previous_checked == current_checked) {
        var checkboxes = container.querySelectorAll('[type="checkbox"]');
        var start_checkbox = null;
        var end_checkbox = null;
        var click_event = new Event('click');
        // select all entries between the two, exclusive (the endpoints are
        // already in the desired state)
        for (var i = 0, checkbox; (checkbox = checkboxes[i]); i++) {
          // we're not sure if current_checkbox comes before or after
          // last_checkbox in the DOM tree, so we have to watch out for both
          // until we see one of them
          if (start_checkbox === null) {
            if (checkbox == previous_checkbox) {
              // previous_checkbox precedes current_checkbox in the DOM
              start_checkbox = previous_checkbox;
              end_checkbox = current_checkbox;
            }
            else if (checkbox == current_checkbox) {
              // current_checkbox precedes previous_checkbox in the DOM
              start_checkbox = current_checkbox;
              end_checkbox = previous_checkbox;
            }
          }
          else {
            // if we have set start_checkbox, we are currently inside the
            // sequence to be selected, and only need to watch for end_checkbox.
            if (checkbox == end_checkbox) {
              break;
            }
            // otherwise, set the checkbox's checked value to current_checked
            checkbox.checked = current_checked;
            // and inform any listeners that it's been "clicked"
            checkbox.dispatchEvent(click_event);
          }
        }
      }
      previous_checkbox = current_checkbox;
      previous_checked = current_checked;
    }
  });
}

exports.CheckboxSequence = CheckboxSequence;

if (typeof angular !== 'undefined') {
  /**
  Use like:

      <table checkbox-sequence>
        <tr ng-repeat="user in users">
          <td><input type="checkbox" ng-model="user.selected"></td>
          <td>{{user.id}}</td>
          <td>{{user.name}}</td>
        </tr>
      </table>
  */
  angular.module('checkbox-sequence', []).directive('checkboxSequence', function() {
    return {
      restrict: 'A',
      link: function(scope, el) {
        new CheckboxSequence(el[0]);
      }
    };
  });
}
