import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Anatomical } from '../api/anatomical.js';
import './anatomical.html';
import './charts/histogram.js';
import './charts/histogram.css';

Anatomical.helpers({
  subjectUrl: function(){
    return this.Participant+'_'+ this.Session;
  },
});

Template.anatomical.helpers({
  anatomical(){
    return Anatomical.find({});

  },
  currentMetric: function(){
    const instance = Template.instance();
    return instance.state.get("current_anatomical_metric")
  },
});

Template.anatomical.events({
  "change #metric-select-anatomical": function(event, template){
    var metric = ""+ $(event.currentTarget).val();
    const instance = Template.instance();
    instance.state.set('current_anatomical_metric', metric);
    histogram(metric);
  },
});


Template.anatomical.onCreated(function anatomicalOnCreated() {
  this.state = new ReactiveDict();
});

Template.anatomical.rendered = function() {
  if(!this._rendered) {
    this._rendered = true;
  }
  this.autorun(function(){
    histogram("CNR");
  });
}

histogram = function(metric) {
  var projection = {};
  projection[metric] = 1;
  //projection['_id'] = 0;
  var data = Anatomical.find({},{fields:projection}).fetch();
  d = _.chain(data)
    .pluck(metric)
    .flatten()
    .value();

  var min_val = Math.min.apply(Math, d);
  var max_val = Math.max.apply(Math, d);
  var chartSize = $("#anatomicalHistogramContainer").width();
  renderHistogram(d, min_val, max_val, "#anatomicalHistogram", chartSize);
}
