xdescribe('Linode - Details - Backup - Create Backup Suite', () => {
    it('should take a snapshot', () => {
        const testSnapshot = 'test-snap-1';
        Backups
            .takeSnapshot(testSnapshot)
            .assertSnapshot(testSnapshot);
    });

    xit('should display restore to existing drawer', () => {
        
    });

   xdescribe('Create New Linode from Backup Suite', () => {
        xit('should display update the create URL to contain backup id', () => {
        
        });

        xit('should display your restoring from backup', () => {
        
        });
    }); 
});