/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class ElementsSelector {
  constructor() {
    this.currOrder = 0;
  }

  element(value) {
    this.checkOrder('element');
    if (this.myElement) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    this.myElement = value;
    return this;
  }

  id(value) {
    this.checkOrder('id');
    if (this.myId) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    this.myId = value;
    return this;
  }

  class(value) {
    this.checkOrder('class');
    if (!this.myClass) this.myClass = [];
    this.myClass.push(value);
    return this;
  }

  attr(value) {
    this.checkOrder('attr');
    this.myAttr = value;
    return this;
  }

  pseudoClass(value) {
    this.checkOrder('pseudo-class');
    if (!this.myPseudoClass) this.myPseudoClass = [];
    this.myPseudoClass.push(value);
    return this;
  }

  pseudoElement(value) {
    this.checkOrder('pseudo-element');
    if (this.myPseudoElement) throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    this.myPseudoElement = value;
    return this;
  }

  combine(selector1, combinator, selector2) {
    this.mySelector = selector1;
    this.myCombinator = combinator;
    this.mySelector2 = selector2;
    return this;
  }

  stringify() {
    let result = '';
    if (this.mySelector && this.mySelector2) {
      return `${this.mySelector} ${this.myCombinator} ${this.mySelector2}`;
    }
    if (this.myElement) result += this.myElement;
    if (this.myId) result += `#${this.myId}`;
    if (this.myClass) result += `.${this.myClass.join('.')}`;
    if (this.myAttr) result += `[${this.myAttr}]`;
    if (this.myPseudoClass) result += `:${this.myPseudoClass.join(':')}`;
    if (this.myPseudoElement) result += `::${this.myPseudoElement}`;
    return result;
  }

  checkOrder(part) {
    const parts = {
      element: 0,
      id: 1,
      class: 2,
      attr: 3,
      'pseudo-class': 4,
      'pseudo-element': 5,
    };
    if (parts[part] < this.currOrder) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.currOrder = parts[part];
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new ElementsSelector().element(value);
  },

  id(value) {
    return new ElementsSelector().id(value);
  },

  class(value) {
    return new ElementsSelector().class(value);
  },

  attr(value) {
    return new ElementsSelector().attr(value);
  },

  pseudoClass(value) {
    return new ElementsSelector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new ElementsSelector().pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    const selector1Str = selector1.stringify();
    const selector2Str = selector2.stringify();
    return new ElementsSelector().combine(selector1Str, combinator, selector2Str);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
