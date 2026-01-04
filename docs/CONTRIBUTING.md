# Contributing to AfflimAI

Thank you for your interest in contributing to AfflimAI! This document provides guidelines and information for contributors.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race or ethnicity
- Age
- Religion
- Nationality

### Our Standards

**Positive Behavior**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable Behavior**:
- Harassment, trolling, or insulting comments
- Public or private harassment
- Publishing others' private information
- Other conduct that would be inappropriate in a professional setting

### Enforcement

Violations may result in:
- Warning
- Temporary ban
- Permanent ban

Report violations to: [your-email@example.com]

---

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
1. **Check existing issues** to avoid duplicates
2. **Verify it's a bug** (not user error)
3. **Test on latest version**

When reporting:
- **Use a clear title**: "Translation fails for Hindi when text contains emojis"
- **Describe steps to reproduce**:
  ```
  1. Generate manifestation with emojis in strengths field
  2. Click translate to Hindi
  3. See error message
  ```
- **Include environment**:
  - OS (macOS 14.1, Ubuntu 22.04, Windows 11)
  - Browser (Chrome 120, Firefox 121)
  - Backend version
- **Attach screenshots/logs**
- **Expected vs Actual behavior**

**Template**:
```markdown
**Bug Description**
Clear description of the bug.

**Steps to Reproduce**
1. Step one
2. Step two
3. See error

**Expected Behavior**
What should happen.

**Actual Behavior**
What actually happens.

**Environment**
- OS: macOS 14.1
- Browser: Chrome 120
- Python: 3.11
- Node: 18.17

**Screenshots**
[Attach if relevant]

**Logs**
```
[Paste relevant logs]
```
```

### Suggesting Features

Before suggesting:
1. **Check roadmap** (if exists)
2. **Search existing feature requests**
3. **Consider scope** (does it fit AfflimAI's purpose?)

When suggesting:
- **Clear use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives considered**: Other ways to solve this?
- **Mockups/examples**: Visual aids if UI-related

**Template**:
```markdown
**Feature Description**
Clear description of the feature.

**Problem It Solves**
What user need does this address?

**Proposed Solution**
How should it work?

**Alternatives**
Other approaches considered?

**Additional Context**
Any other information.
```

### Improving Documentation

Documentation improvements are always welcome:
- Fix typos
- Clarify confusing sections
- Add examples
- Update outdated information
- Translate to other languages

**Good documentation PRs**:
- Focused on specific improvement
- Use clear, simple language
- Include code examples where helpful
- Test that all links work

---

## Development Setup

See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md#getting-started) for complete setup instructions.

**Quick Start**:

```bash
# Clone
git clone https://github.com/yourusername/AfflimAI.git
cd AfflimAI

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab')"

# Create .env
echo "HUGGINGFACE_API_KEY=your_key_here" > .env
echo "MODEL_ID=deepseek-ai/DeepSeek-V3" >> .env

# Run
uvicorn app.main:app --reload

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

Verify:
- Backend: `http://localhost:8000/docs`
- Frontend: `http://localhost:8080`

---

## Making Changes

### Branch Naming

```
feature/<short-description>    # New features
bugfix/<issue-number>          # Bug fixes
docs/<what-docs>               # Documentation
refactor/<component-name>      # Code refactoring
test/<what-testing>            # Adding tests
```

**Examples**:
- `feature/portuguese-translation`
- `bugfix/42-audio-generation-timeout`
- `docs/api-examples`
- `refactor/vector-store-cleanup`

### Workflow

```bash
# 1. Create branch from main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Make changes
# ... edit files ...

# 3. Test locally
# Backend: Test in Swagger UI
# Frontend: Test in browser

# 4. Commit with clear message
git add .
git commit -m "feat: add Portuguese translation support

- Added 'pt' to SUPPORTED_LANGUAGES
- Added Portuguese TTS voices
- Updated frontend language selector
- Added documentation for new language"

# 5. Push to your fork
git push origin feature/my-feature

# 6. Create Pull Request on GitHub
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines (see below)
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors
- [ ] Tested locally
- [ ] Commit messages follow convention

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
- [ ] Manual testing
- [ ] Automated tests (if applicable)

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have self-reviewed my code
- [ ] I have commented complex code
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have tested with multiple scenarios
```

### Review Process

1. **Automated Checks** (if CI/CD configured):
   - Linting passes
   - Build succeeds
   - Tests pass

2. **Code Review**:
   - Maintainer reviews code
   - May request changes
   - Discussion in PR comments

3. **Approval**:
   - Maintainer approves
   - PR merged to main

4. **Post-Merge**:
   - Branch deleted
   - Issue closed (if linked)

---

## Coding Standards

### Python (Backend)

**Style**: PEP 8

```python
# Good
async def translate_text(
    text: str,
    target_language: str,
    username: Optional[str] = None
) -> str:
    """
    Translate text using RAG pipeline.
    
    Args:
        text: English text to translate
        target_language: Target language code (ta, hi)
        username: Optional username for vector store
        
    Returns:
        Translated text
        
    Raises:
        ValueError: If target_language not supported
    """
    if target_language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language: {target_language}")
    
    # Implementation
    pass


# Bad
def translate(txt, lang, user=None):  # No types, unclear names
    if lang not in langs:
        raise Exception("bad lang")  # Generic exception
    # no docstring
```

**Guidelines**:
- Use type hints
- Write docstrings (Google style)
- Use descriptive names
- Keep functions small (<50 lines)
- Use `async`/`await` for I/O
- Handle errors gracefully

### TypeScript (Frontend)

**Style**: Airbnb + Prettier

```typescript
// Good
interface TranslationState {
  status: "idle" | "loading" | "success" | "error";
  text: string;
  error?: string;
}

export function TranslationPanel({ manifestation }: { manifestation: string }) {
  const [state, setState] = useState<TranslationState>({
    status: "idle",
    text: "",
  });

  const handleTranslate = async (language: string) => {
    setState({ ...state, status: "loading" });
    
    try {
      const result = await translateManifestation(manifestation, language);
      setState({ status: "success", text: result.translated_text });
    } catch (error) {
      setState({ 
        status: "error", 
        text: "", 
        error: error.message 
      });
    }
  };

  return (
    <div className="p-4">
      {/* ... */}
    </div>
  );
}


// Bad
function Panel(props) {  // No types
  const [txt, setTxt] = useState("")  // Unclear name
  
  function go(lang) {  // Unclear name
    // No error handling
    translateManifestation(props.data, lang).then(r => setTxt(r.text))
  }
  
  return <div style={{padding: 16}}>{/* inline styles */}</div>
}
```

**Guidelines**:
- Define interfaces for props
- Use functional components + hooks
- Destructure props
- Prefer `const` arrow functions
- Use Tailwind (no inline styles)
- Handle loading/error states

---

## Testing Guidelines

### Manual Testing

**Backend**:
1. Test in Swagger UI (`/docs`)
2. Test with cURL commands
3. Verify error cases
4. Check logs for errors

**Frontend**:
1. Test happy path (normal usage)
2. Test edge cases (empty fields, long text)
3. Test error handling (API failures)
4. Test on multiple browsers
5. Test responsive design (mobile)

### Automated Testing (Future)

When adding tests:

**Backend** (pytest):
```python
# tests/test_translation.py
import pytest
from app.rag_translate import translate_with_rag

def test_tamil_translation():
    result = translate_with_rag(
        text="I am powerful",
        target_language="ta",
        username="test_user"
    )
    assert len(result) > 0
    assert "நான்" in result  # "I" in Tamil

def test_unsupported_language():
    with pytest.raises(ValueError):
        translate_with_rag("test", "fr", "user")
```

**Frontend** (Vitest):
```typescript
// tests/TranslationPanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationPanel } from './TranslationPanel';

test('shows loading state when translating', async () => {
  render(<TranslationPanel manifestation="test" />);
  
  fireEvent.click(screen.getByText('Translate to Tamil'));
  
  expect(screen.getByText('Translating...')).toBeInTheDocument();
});
```

---

## Documentation

### When to Update Docs

Update documentation when you:
- Add new features
- Change API contracts
- Modify configuration
- Fix bugs (if relevant)
- Add new dependencies

### Where to Document

| Change Type | File to Update |
|-------------|----------------|
| New API endpoint | `docs/API_REFERENCE.md` |
| Architecture change | `docs/ARCHITECTURE.md` |
| New setup step | `docs/DEVELOPER_GUIDE.md` |
| User-facing feature | `docs/USER_GUIDE.md`, `README.md` |
| Deployment change | `docs/DEPLOYMENT.md` |
| New language | `docs/RAG_SYSTEM.md` |
| Breaking change | `CHANGELOG.md` |

### Documentation Style

- **Be concise**: Short sentences, clear language
- **Use examples**: Show, don't just tell
- **Be specific**: "Click the blue 'Translate' button" not "Click the button"
- **Use visuals**: Diagrams, screenshots where helpful
- **Test instructions**: Follow your own docs to verify

---

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance (dependencies, config)

### Examples

```
feat(translation): add Portuguese language support

- Added 'pt' to SUPPORTED_LANGUAGES
- Configured Brazilian Portuguese TTS voices (male/female)
- Updated frontend language selector
- Added Portuguese to ChromaDB collections

Closes #42
```

```
fix(audio): handle timeout errors gracefully

Previously, TTS timeout errors would crash the endpoint.
Now returns a 503 error with retry message.

Fixes #38
```

```
docs(api): add Python client examples

Added code examples for generating manifestations,
translations, and audio using Python requests library.
```

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Questions?

- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Use GitHub Issues for bugs/features
- 📧 **Email**: [your-email@example.com] for private inquiries

---

## Recognition

Contributors will be recognized in:
- `README.md` contributors section
- Release notes
- GitHub contributors graph

Thank you for making AfflimAI better! 🙏✨

---

*Last Updated: January 2, 2026*
