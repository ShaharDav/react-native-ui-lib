import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import {StyleSheet, Animated} from 'react-native';
import {Colors} from '../../style';
import {BaseComponent} from '../../commons';
import TouchableOpacity from '../touchableOpacity';
import View from '../view';
import {RadioGroupContext} from './RadioGroup';

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = Colors.blue30;

/**
 * A Radio Button component, should be wrapped inside a RadioGroup
 */
class RadioButton extends BaseComponent {
  static displayName = 'RadioButton';

  static propTypes = {
    /**
     * The identifier value of the radio button. must be different than other RadioButtons in the same group
     */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    /**
     * When using RadioButton without a RadioGroup, use this prop to toggle selection
     */
    selected: PropTypes.bool,
    /**
     * Invoked when pressing the button
     */
    onPress: PropTypes.func,
    /**
     * Whether the radio button should be disabled
     */
    disabled: PropTypes.bool,
    /**
     * The color of the radio button
     */
    color: PropTypes.string,
    /**
     * The size of the radio button, affect both width & height
     */
    size: PropTypes.number,
    /**
     * The radio button border radius
     */
    borderRadius: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      opacityAnimationValue: new Animated.Value(0),
      scaleAnimationValue: new Animated.Value(0.8)
    };
    
    this.selected = undefined;
    this.selectedPrevState = undefined;
  }

  componentDidMount() {
    this.animate();
  }

  componentDidUpdate(prevProps) {
    if (this.props.selected === undefined) { // will always be radio group
      if (this.selectedPrevState && !this.selected) { // unselect
        this.animate();
      }
    } else if (prevProps.selected !== this.props.selected) { // will always be individual
      this.selected = this.props.selected;
      this.animate();
    }
  }

  animate() {
    const animationTime = 150;
    const animationDelay = 60;
    if (this.selected) {
      Animated.parallel([
        Animated.timing(this.state.opacityAnimationValue, {
          toValue: 1,
          duration: animationTime,
        }),
        Animated.timing(this.state.scaleAnimationValue, {
          toValue: 1,
          delay: animationDelay,
          duration: animationTime,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(this.state.scaleAnimationValue, {
          toValue: 0.8,
          duration: animationTime,
        }),
        Animated.timing(this.state.opacityAnimationValue, {
          toValue: 0,
          delay: animationDelay,
          duration: animationTime,
        }),
      ]).start();
    }
  }

  generateStyles() {
    this.styles = createStyles(this.getThemeProps());
  }

  onPress = context => {
    const {value, disabled} = this.props;
    if (!disabled) {
      _.invoke(context, 'onValueChange', value);
      _.invoke(this.props, 'onPress', this.selected);
      if (value) { // so individual is not called here as well
        if (!this.selected) {
          this.selected = !this.selected;
          this.animate();
        }
      }
    }
  };

  isSelected(props = this.props, context) {
    const {value, selected} = props;
    // Individual Radio Button
    if (_.isUndefined(value)) {
      return Boolean(selected);
    }
    // Grouped Radio Button
    const {value: selectedValue} = context;
    return value === selectedValue;
  }

  getContainerStyle() {
    const {color, size, borderRadius, style: propsStyle, disabled} = this.getThemeProps();
    const style = [this.styles.container];

    if (size) {
      style.push({width: size, height: size});
    }
    if (borderRadius) {
      style.push({borderRadius});
    }
    if (color) {
      style.push({borderColor: disabled ? Colors.dark70 : color});
    }

    style.push(propsStyle);
    return style;
  }

  getSelectedStyle() {
    const {color, borderRadius, disabled} = this.getThemeProps();
    const style = [this.styles.selectedIndicator];

    if (borderRadius) {
      style.push({borderRadius});
    }
    if (color) {
      style.push({backgroundColor: disabled ? Colors.dark70 : color});
    }

    return style;
  }

  renderRadioButton = context => {
    const {style, onPress, ...others} = this.getThemeProps();
    const Container = onPress || context.onValueChange ? TouchableOpacity : View;
    this.selectedPrevState = this.selected;
    this.selected = this.isSelected(this.props, context);
    return (
      <Container activeOpacity={1} {...others} style={this.getContainerStyle()} onPress={() => this.onPress(context)}>
        {<Animated.View
          style={[
            this.getSelectedStyle(),
            {opacity: this.state.opacityAnimationValue},
            {scaleX: this.state.scaleAnimationValue},
            {scaleY: this.state.scaleAnimationValue}
          ]}
        />}
      </Container>
    );
  };

  render() {
    return <RadioGroupContext.Consumer>{this.renderRadioButton}</RadioGroupContext.Consumer>;
  }
}

function createStyles({size = DEFAULT_SIZE, borderRadius = DEFAULT_SIZE / 2, color = DEFAULT_COLOR, disabled}) {
  return StyleSheet.create({
    container: {
      borderWidth: 2,
      borderColor: disabled ? Colors.dark70 : color,
      width: size,
      height: size,
      borderRadius,
      padding: 3,
    },
    selectedIndicator: {
      backgroundColor: disabled ? Colors.dark70 : color,
      flex: 1,
      borderRadius,
    },
  });
}

export default RadioButton;
