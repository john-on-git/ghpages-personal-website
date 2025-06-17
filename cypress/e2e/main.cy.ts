describe('Main.', () => {
  beforeEach(function() {
      cy.visit('127.0.0.1:3000');
  })
  it('All sidebar links change color when hovered.', () => {
    //throw new Error('not implemented');
  })
  it('The featured article changes color when hovered.', () => {
    //throw new Error('not implemented');
  })
  it('The header of the featured article section has the correct content. ', () => {
    cy.getByCy("featured-article").contains("Featured Article");
  })
  it('The site changes over time.', () => 
    cy.screenshot('background_initial').wait(2000).then(() => {
      throw new Error('not implemented')
    })
  )
})