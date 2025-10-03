const { TeamMember } = require('../../../src/models');

describe('TeamMember Model', () => {
  describe('Validation', () => {
    test('should create a valid team member', async () => {
      const memberData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        position: 'Developer',
        department: 'Development'
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember._id).toBeDefined();
      expect(savedMember.firstName).toBe(memberData.firstName);
      expect(savedMember.lastName).toBe(memberData.lastName);
      expect(savedMember.email).toBe(memberData.email);
      expect(savedMember.position).toBe(memberData.position);
      expect(savedMember.department).toBe(memberData.department);
      expect(savedMember.isActive).toBe(true); // default value
    });

    test('should require firstName field', async () => {
      const member = new TeamMember({
        lastName: 'Doe',
        email: 'john.doe@test.com',
        position: 'Developer',
        department: 'Development'
      });

      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.firstName).toBeDefined();
    });

    test('should require lastName field', async () => {
      const member = new TeamMember({
        firstName: 'John',
        email: 'john.doe@test.com',
        position: 'Developer',
        department: 'Development'
      });

      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.lastName).toBeDefined();
    });

    test('should require unique email', async () => {
      const member1 = new TeamMember(createTestTeamMember());
      await member1.save();

      const member2 = new TeamMember(createTestTeamMember());
      
      let error;
      try {
        await member2.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    test('should validate email format', async () => {
      const member = new TeamMember({
        ...createTestTeamMember(),
        email: 'invalid-email'
      });

      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    test('should validate phone format', async () => {
      const member = new TeamMember({
        ...createTestTeamMember(),
        phone: 'invalid-phone'
      });

      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.phone).toBeDefined();
    });

    test('should accept valid phone format', async () => {
      const member = new TeamMember({
        ...createTestTeamMember(),
        phone: '+1234567890'
      });

      const savedMember = await member.save();
      expect(savedMember.phone).toBe('+1234567890');
    });
  });

  describe('Skills Array', () => {
    test('should handle skills with validation', async () => {
      const memberData = {
        ...createTestTeamMember(),
        skills: [
          {
            name: 'JavaScript',
            level: 'Expert',
            yearsOfExperience: 5
          },
          {
            name: 'React',
            level: 'Advanced',
            yearsOfExperience: 3
          }
        ]
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember.skills).toHaveLength(2);
      expect(savedMember.skills[0].name).toBe('JavaScript');
      expect(savedMember.skills[0].level).toBe('Expert');
      expect(savedMember.skills[1].name).toBe('React');
    });

    test('should validate skill level enum', async () => {
      const memberData = {
        ...createTestTeamMember(),
        skills: [
          {
            name: 'JavaScript',
            level: 'Invalid Level',
            yearsOfExperience: 5
          }
        ]
      };

      const member = new TeamMember(memberData);
      
      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['skills.0.level']).toBeDefined();
    });

    test('should validate years of experience minimum', async () => {
      const memberData = {
        ...createTestTeamMember(),
        skills: [
          {
            name: 'JavaScript',
            level: 'Expert',
            yearsOfExperience: -1
          }
        ]
      };

      const member = new TeamMember(memberData);
      
      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['skills.0.yearsOfExperience']).toBeDefined();
    });
  });

  describe('Social Links', () => {
    test('should validate social media URLs', async () => {
      const memberData = {
        ...createTestTeamMember(),
        socialLinks: {
          linkedin: 'invalid-url',
          github: 'https://github.com/valid',
          twitter: 'https://twitter.com/valid'
        }
      };

      const member = new TeamMember(memberData);
      
      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['socialLinks.linkedin']).toBeDefined();
    });

    test('should accept valid social media URLs', async () => {
      const memberData = {
        ...createTestTeamMember(),
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johndoe',
          github: 'https://github.com/johndoe',
          twitter: 'https://twitter.com/johndoe'
        }
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember.socialLinks.linkedin).toBe('https://linkedin.com/in/johndoe');
      expect(savedMember.socialLinks.github).toBe('https://github.com/johndoe');
      expect(savedMember.socialLinks.twitter).toBe('https://twitter.com/johndoe');
    });
  });

  describe('Experience Array', () => {
    test('should handle work experience with validation', async () => {
      const memberData = {
        ...createTestTeamMember(),
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: new Date('2020-01-01'),
            endDate: new Date('2023-01-01'),
            description: 'Led development team',
            technologies: ['React', 'Node.js']
          }
        ]
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember.experience).toHaveLength(1);
      expect(savedMember.experience[0].company).toBe('Tech Corp');
      expect(savedMember.experience[0].position).toBe('Senior Developer');
    });

    test('should validate end date is after start date', async () => {
      const memberData = {
        ...createTestTeamMember(),
        experience: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: new Date('2023-01-01'),
            endDate: new Date('2020-01-01'), // Invalid: end before start
            description: 'Developer role'
          }
        ]
      };

      const member = new TeamMember(memberData);
      
      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['experience.0.endDate']).toBeDefined();
    });
  });

  describe('Certifications and Awards', () => {
    test('should handle certifications array', async () => {
      const memberData = {
        ...createTestTeamMember(),
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon',
            dateEarned: new Date('2022-01-01'),
            expiryDate: new Date('2025-01-01'),
            credentialId: 'AWS-123456'
          }
        ]
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember.certifications).toHaveLength(1);
      expect(savedMember.certifications[0].name).toBe('AWS Certified Developer');
      expect(savedMember.certifications[0].issuer).toBe('Amazon');
    });

    test('should handle awards array', async () => {
      const memberData = {
        ...createTestTeamMember(),
        awards: [
          {
            name: 'Employee of the Year',
            year: 2023,
            issuer: 'Company',
            description: 'Outstanding performance'
          }
        ]
      };

      const member = new TeamMember(memberData);
      const savedMember = await member.save();

      expect(savedMember.awards).toHaveLength(1);
      expect(savedMember.awards[0].name).toBe('Employee of the Year');
      expect(savedMember.awards[0].year).toBe(2023);
    });

    test('should validate award year range', async () => {
      const memberData = {
        ...createTestTeamMember(),
        awards: [
          {
            name: 'Test Award',
            year: 1800, // Too old
            issuer: 'Company'
          }
        ]
      };

      const member = new TeamMember(memberData);
      
      let error;
      try {
        await member.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors['awards.0.year']).toBeDefined();
    });
  });

  describe('Virtual Fields', () => {
    test('should calculate fullName virtual', async () => {
      const member = new TeamMember({
        ...createTestTeamMember(),
        firstName: 'John',
        lastName: 'Doe'
      });
      
      const savedMember = await member.save();
      expect(savedMember.fullName).toBe('John Doe');
    });

    test('should calculate yearsAtCompany virtual', async () => {
      const joinDate = new Date();
      joinDate.setFullYear(joinDate.getFullYear() - 2); // 2 years ago

      const member = new TeamMember({
        ...createTestTeamMember(),
        joinDate: joinDate
      });
      
      const savedMember = await member.save();
      expect(savedMember.yearsAtCompany).toBe(2);
    });

    test('should include virtuals in JSON output', async () => {
      const member = new TeamMember(createTestTeamMember());
      const savedMember = await member.save();
      
      const memberJSON = savedMember.toJSON();
      expect(memberJSON.fullName).toBeDefined();
      expect(memberJSON.yearsAtCompany).toBeDefined();
    });
  });
});